const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const router = express.Router();

router.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController);
router.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController);
router.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController);
router.get("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController);
router.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController);

module.exports = router;
