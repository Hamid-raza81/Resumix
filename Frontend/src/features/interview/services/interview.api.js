import axios from "axios";

const api = axios.create({ baseURL: "/api", withCredentials: true });

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);
  formData.append("resume", resumeFile);
  return (await api.post("/interview", formData)).data;
};

export const getInterviewReportById = async (interviewId) => (await api.get(`/interview/report/${interviewId}`)).data;
export const getAllInterviewReports = async () => (await api.get("/interview")).data;
const readBlobError = async (data, fallback) => {
  if (!(data instanceof Blob)) return data?.message || fallback;
  const text = await data.text();
  try {
    return JSON.parse(text).message || fallback;
  } catch {
    return text || fallback;
  }
};

export const generateResumePdf = async (interviewReportId) => {
  try {
    const response = await api.get(`/interview/resume/pdf/${interviewReportId}`, {
      responseType: "blob",
      timeout: 0,
    });
    return response.data;
  } catch (error) {
    const message = await readBlobError(error.response?.data, error.message || "Could not generate the resume PDF.");
    throw new Error(message);
  }
};
