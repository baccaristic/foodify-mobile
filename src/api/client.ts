import axios from "axios";
import { BASE_API_URL } from "@env";

const client = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  const token = null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response || error.message);
    return Promise.reject(error);
  }
);

export default client;