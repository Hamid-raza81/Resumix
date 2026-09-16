import axios from "axios";

const api = axios.create({ baseURL: "/api", withCredentials: true });

export const register = async (payload) => (await api.post("/auth/register", payload)).data;
export const login = async (payload) => (await api.post("/auth/login", payload)).data;
export const logout = async () => (await api.post("/auth/logout")).data;
export const getMe = async () => (await api.get("/auth/get-me")).data;
