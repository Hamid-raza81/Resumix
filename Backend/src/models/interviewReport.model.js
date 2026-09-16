const mongoose = require("mongoose");

const technicalQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    intention: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const behavioralQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    intention: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
  },
  { _id: false },
);

const preparationPlanSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  focus: { type: String, required: true },
  tasks: [{ type: String, required: true }],
});

const interviewReportSchema = new mongoose.Schema(
  {
    jobDescription: { type: String, required: true },
    resume: { type: String, required: true },
    selfDescription: { type: String, default: "" },
    matchScore: { type: Number, min: 0, max: 100, required: true },
    technicalQuestions: { type: [technicalQuestionSchema], default: [] },
    behavioralQuestions: { type: [behavioralQuestionSchema], default: [] },
    skillGaps: { type: [skillGapSchema], default: [] },
    preparationPlan: { type: [preparationPlanSchema], default: [] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    title: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InterviewReport", interviewReportSchema);
