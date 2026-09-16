import { useContext, useEffect } from "react";
import { useParams } from "react-router";
import { InterviewContext } from "../interview.context";
import { generateInterviewReport, generateResumePdf, getAllInterviewReports, getInterviewReportById } from "../services/interview.api";

export const useInterview = () => {
  const context = useContext(InterviewContext);
  const { interviewId } = useParams();
  if (!context) throw new Error("useInterview must be used within InterviewProvider");
  const { loading, setLoading, report, setReport, reports, setReports } = context;

  const generateReport = async (payload) => {
    setLoading(true);
    try {
      const data = await generateInterviewReport(payload);
      setReport(data.interviewReport);
      return data.interviewReport;
    } finally { setLoading(false); }
  };

  const getReportById = async (id) => {
    setLoading(true);
    try {
      const data = await getInterviewReportById(id);
      setReport(data.interviewReport);
      return data.interviewReport;
    } finally { setLoading(false); }
  };

  const getReports = async () => {
    setLoading(true);
    try {
      const data = await getAllInterviewReports();
      setReports(data.interviewReports || []);
      return data.interviewReports || [];
    } finally { setLoading(false); }
  };

  const downloadResume = async (id) => {
    setLoading(true);
    try {
      const data = await generateResumePdf(id);
      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
      const signature = await blob.slice(0, 5).text();
      if (!signature.startsWith("%PDF")) {
        const text = await blob.text();
        let message = "Could not download the tailored resume.";
        try {
          message = JSON.parse(text).message || message;
        } catch {
          if (text.trim()) message = text;
        }
        throw new Error(message);
      }

      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resumix-resume-${id}.pdf`;
      link.rel = "noopener";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interviewId) getReportById(interviewId).catch(console.error);
    else getReports().catch(console.error);
  }, [interviewId]);

  return { loading, report, reports, generateReport, getReportById, getReports, downloadResume };
};
