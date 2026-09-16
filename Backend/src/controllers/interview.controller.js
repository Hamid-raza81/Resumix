const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterViewReportController(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a PDF resume." });
  }

  const { selfDescription = "", jobDescription = "" } = req.body;
  if (!jobDescription.trim()) {
    return res.status(400).json({ message: "Job description is required." });
  }

  const parsed = await new pdfParse.PDFParse(Uint8Array.from(req.file.buffer)).getText();
  const resumeText = parsed.text?.trim();

  if (!resumeText) {
    return res.status(400).json({ message: "Could not extract text from the PDF resume." });
  }

  const aiReport = await generateInterviewReport({
    resume: resumeText,
    selfDescription,
    jobDescription,
  });

  const interviewReport = await interviewReportModel.create({
    user: req.user.id,
    resume: resumeText,
    selfDescription,
    jobDescription,
    ...aiReport,
  });

  return res.status(201).json({
    message: "Interview report generated successfully.",
    interviewReport,
  });
}

async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;
  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report not found." });
  }

  return res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport,
  });
}

async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

  return res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
}

async function generateResumePdfController(req, res) {
  req.setTimeout(5 * 60 * 1000);
  res.setTimeout(5 * 60 * 1000);

  const { interviewReportId } = req.params;
  const interviewReport = await interviewReportModel.findOne({
    _id: interviewReportId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report not found." });
  }

  const pdfBuffer = await generateResumePdf({
    resume: interviewReport.resume,
    jobDescription: interviewReport.jobDescription,
    selfDescription: interviewReport.selfDescription,
  });

  const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Length": buffer.length,
    "Content-Disposition": `attachment; filename="resume_${interviewReportId}.pdf"`,
    "Cache-Control": "no-store",
  });
  return res.end(buffer);
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
