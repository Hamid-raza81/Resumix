const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_GENAI_API_KEY is missing in Backend/.env");
}

const ai = new GoogleGenAI({ apiKey });
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    }),
  ),
  title: z.string(),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `

You are an expert ATS resume evaluator, technical recruiter, interviewer, and career coach.

Your job is to compare the candidate's RESUME and SELF DESCRIPTION against the JOB DESCRIPTION and produce a realistic match score from 0 to 100.

IMPORTANT:

Do NOT give an arbitrary or inflated score.

Do NOT assume that similar words automatically mean a job match.

Do NOT invent candidate experience.

The RESUME is the primary source of evidence.

The SELF DESCRIPTION is only supporting evidence.

==================================================

STEP 1: VALIDATE THE JOB DESCRIPTION

==================================================

Before calculating the score, determine whether the JOB DESCRIPTION is a genuine job description.

A valid job description should contain meaningful job-related information such as:

- Job title or role

- Required technical skills

- Preferred skills

- Job responsibilities

- Required experience

- Education requirements

- Tools or technologies

- Domain-specific requirements

Examples of INVALID JD:

"hello this is testing"

"how are you"

"this is random text"

"abcdef xyz"

"I like football and food"

If the JD is random, meaningless, extremely vague, or contains no identifiable job requirements:

- matchScore MUST be between 0 and 10.

- If there are absolutely no meaningful job requirements, use matchScore = 0.

- Do NOT use general semantic similarity to create a high score.

- Do NOT invent a job role.

- Do NOT assume technologies or requirements.

- skillGaps should contain an appropriate explanation such as:

  "No meaningful job requirements detected."

- technicalQuestions should be empty or contain only a minimal question explaining that a valid JD is required.

- behavioralQuestions should be empty or minimal.

- preparationPlan should be minimal.

- title should indicate that the JD is invalid or insufficient.

NEVER give 80%, 90%, or 100% to random JD text.

==================================================

STEP 2: EXTRACT JOB REQUIREMENTS

==================================================

For a valid JD, identify:

1. Required technical skills

2. Preferred technical skills

3. Responsibilities

4. Required experience

5. Education requirements

6. Important tools/frameworks

7. Domain-specific requirements

Do not invent requirements that are not present in the JD.

==================================================

STEP 3: MATCH THE RESUME

==================================================

The RESUME is the PRIMARY source of candidate evidence.

Evaluate:

A. Required skill match

B. Experience match

C. Project match

D. Responsibility match

E. Education match

F. Technical evidence

A skill mentioned in an actual project or work experience is stronger evidence than a skill appearing only in the Skills section.

For example:

"Built an e-commerce application using React and Node.js."

is stronger evidence than:

"Skills: React, Node.js."

Do not assume that simply listing a skill means the candidate has strong practical experience.

==================================================

STEP 4: MATCH THE SELF DESCRIPTION

==================================================

The SELF DESCRIPTION is secondary evidence only.

Use it to support the resume, NOT replace the resume.

Examples:

"I have built React applications."

=> useful supporting evidence.

"I know React."

=> moderate evidence.

"I am interested in React."

=> weak evidence.

"I want to learn React."

=> very weak evidence.

Do NOT treat career interests, goals, or technologies the candidate wants to learn as proven experience.

The self description must NOT compensate for major missing requirements in the resume.

==================================================

STEP 5: SKILL NORMALIZATION

==================================================

Treat obvious naming variations as the same skill.

Examples:

React = React.js = ReactJS = React JS

Node = Node.js = NodeJS = Node JS

Express = Express.js = ExpressJS

Mongo = MongoDB = Mongo DB

JavaScript = JS

TypeScript = TS

PostgreSQL = Postgres

However, do NOT treat different technologies as exact matches.

Examples:

Java != JavaScript

React != Angular

MongoDB != MySQL

Node.js != Java Spring Boot

Python != Java

Related technologies may receive limited contextual credit, but never full credit as an exact skill match.

==================================================

STEP 6: REQUIRED VS PREFERRED SKILLS

==================================================

Required skills have substantially more importance than preferred skills.

Missing an important REQUIRED skill should significantly reduce the score.

Missing a PREFERRED skill should have a smaller effect.

Do not give a candidate a high score simply because they match many optional skills while missing important required skills.

==================================================

STEP 7: SCORING

==================================================

For a VALID job description, use approximately this weighting:

Required Skills              = 40%

Resume Experience/Evidence   = 25%

Projects & Responsibilities  = 15%

Experience Level              = 10%

Self Description              = 10%

The final matchScore must be between 0 and 100.

Use these ranges as guidance:

0-10:

Invalid JD or almost no meaningful overlap.

11-30:

Very poor match. Candidate lacks most important requirements.

31-50:

Weak match. Candidate has some relevant skills but major gaps exist.

51-70:

Moderate match. Candidate meets several important requirements.

71-85:

Strong match. Candidate meets most important requirements with reasonable evidence.

86-95:

Very strong match. Candidate satisfies nearly all important requirements with strong evidence.

96-100:

Exceptional match. Use only when the candidate clearly satisfies essentially all important requirements.

Do NOT inflate the score.

==================================================

STEP 8: SEMANTIC SIMILARITY

==================================================

Semantic similarity may be considered as supporting evidence only.

It must NEVER override:

- Missing required skills

- Missing experience

- Missing projects

- Contradictory technologies

- Invalid JD

For example:

JD:

"Develop REST APIs using Node.js and Express."

Resume:

"Built a task management backend using Express.js, Node.js, MongoDB and CRUD APIs."

This is strong relevant evidence even if the exact sentences differ.

But:

JD:

"React, Node.js, MongoDB"

Resume:

"Java, Spring Boot, MySQL"

must remain a low match even though both are software development technologies.

==================================================

STEP 9: PREVENT FALSE HIGH SCORES

==================================================

Never give a high score because:

- Both texts mention "software".

- Both mention "developer".

- Both contain generic words such as "project", "technology", "team", or "experience".

- The self-description sounds enthusiastic.

- The candidate says they want to learn a required technology.

- The resume is long.

- The resume is professionally written.

Only job-relevant evidence should contribute to the match.

==================================================

STEP 10: SKILL GAPS

==================================================

Identify the most important missing requirements.

Use:

"high" severity for important missing required skills.

"medium" severity for partially matched or important preferred skills.

"low" severity for minor gaps.

Do not list skills that are not required or relevant to the JD.

==================================================

STEP 11: INTERVIEW QUESTIONS

==================================================

Generate practical technical interview questions based on the actual JOB DESCRIPTION and the candidate's actual RESUME.

Questions should help identify whether the candidate genuinely understands the skills claimed in the resume.

Do not invent experience.

Behavioral questions should be relevant to the job role.

==================================================

STEP 12: PREPARATION PLAN

==================================================

Create a practical preparation plan based on the candidate's actual skill gaps.

Focus more heavily on missing REQUIRED skills.

==================================================

CANDIDATE RESUME:

${resume || "Not provided"}

SELF DESCRIPTION:

${selfDescription || "Not provided"}

JOB DESCRIPTION:

${jobDescription || "Not provided"}

Now:

1. Validate the JD.

2. Extract its meaningful requirements.

3. Compare the requirements primarily against the resume.

4. Use the self-description only as secondary evidence.

5. Calculate a realistic matchScore.

6. Identify skill gaps.

7. Generate relevant interview questions.

8. Generate a realistic preparation plan.

The matchScore must reflect actual job relevance, NOT generic text similarity.

`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  const raw = response.text;
  if (!raw) throw new Error("Gemini returned an empty response.");
  return interviewReportSchema.parse(JSON.parse(raw));
}

function wrapResumeHtml(htmlContent) {
  if (/<html[\s>]/i.test(htmlContent)) return htmlContent;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlContent}</body></html>`;
}

async function launchBrowser() {
  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
  ];
  const candidates = [
    { headless: true, channel: "chrome", args },
    { headless: true, channel: "chrome-headless-shell", args },
    {
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args,
    },
    { headless: true, args },
  ];

  let lastError;
  for (const options of candidates) {
    if (options.executablePath === undefined && "executablePath" in options)
      continue;
    try {
      return await puppeteer.launch(options);
    } catch (error) {
      lastError = error;
    }
  }

  throw (
    lastError ||
    new Error("Could not launch Chrome to generate the resume PDF.")
  );
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (/^https?:/i.test(request.url())) return request.abort();
      return request.continue();
    });
    await page.setContent(wrapResumeHtml(htmlContent), {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumeSchema = z.object({ html: z.string() });

  const prompt = `
Create a professional ATS-friendly one-to-two-page resume as HTML.
Return ONLY the JSON structure required by the schema.
Use the candidate's real information and tailor emphasis to the job description.
Do not invent employers, degrees, dates, skills, achievements, or certifications.
Use inline CSS so the HTML renders correctly in a browser.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription || "Not provided"}

JOB DESCRIPTION:
${jobDescription}
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumeSchema),
    },
  });

  const raw = response.text;
  if (!raw) throw new Error("Gemini returned an empty resume response.");
  const { html } = resumeSchema.parse(JSON.parse(raw));
  return generatePdfFromHtml(html);
}

module.exports = { generateInterviewReport, generateResumePdf };
