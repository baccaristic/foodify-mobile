import axios from "axios";
import { BASE_API_URL } from "@env";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const client = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
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
