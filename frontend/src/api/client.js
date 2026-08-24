import axios from "axios";

const client = axios.create({
  baseURL: "/api",
});


client.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("fmc-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const getReports = (filters = {}) =>
  client.get("/reports", { params: filters }).then((res) => res.data);

export const getReport = (id) => client.get(`/reports/${id}`).then((res) => res.data);

export const createReport = (payload) =>
  client.post("/reports", payload).then((res) => res.data);

export const updateReport = (id, payload) =>
  client.put(`/reports/${id}`, payload).then((res) => res.data);

export const updateReportStatus = (id, status) =>
  client.patch(`/reports/${id}/status`, { status }).then((res) => res.data);

export const deleteReport = (id) => client.delete(`/reports/${id}`).then((res) => res.data);


export const getGuidance = () => client.get("/guidance").then((res) => res.data);

export const geocodeLocation = (q) =>
  client.get("/geocode", { params: { q } }).then((res) => res.data);


export const login = (email, password) =>
  client.post("/auth/login", { email, password }).then((res) => res.data);

export const register = (name, email, password) =>
  client.post("/auth/register", { name, email, password }).then((res) => res.data);


export const getAnalyticsSummary = () => client.get("/analytics/summary").then((res) => res.data);

export const getReminders = () => client.get("/analytics/reminders").then((res) => res.data);


export async function downloadExport(format, filters = {}) {
  const response = await client.get(`/export/${format}`, {
    params: filters,
    responseType: "blob",
  });

  const disposition = response.headers["content-disposition"] || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `fixmycampus-reports.${format}`;

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default client;
