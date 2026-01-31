import axios, { AxiosResponse } from "axios"
import { getAccessToken, refreshAccessToken } from "./getUser"

const baseURL = "http://localhost:8000/";

type DataProps = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  endpoint: string
  data?: Record<string, unknown>
  responseType?: "json" | "blob" | "text" | "arraybuffer"
  requiresAuth?: boolean
}

export const requestUrl = async <T = unknown>(data: DataProps): Promise<AxiosResponse<T>> => {
  const token = data.requiresAuth !== false ? getAccessToken() : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    return await axios({
      method: data.method,
      url: `${baseURL}${data.endpoint}/`,
      data: data?.data,
      responseType: data?.responseType || "json",
      headers,
    });
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError?.response?.status === 401 && data.requiresAuth !== false) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = getAccessToken();
        headers["Authorization"] = `Bearer ${newToken}`;
        return await axios({
          method: data.method,
          url: `${baseURL}${data.endpoint}/`,
          data: data?.data,
          responseType: data?.responseType || "json",
          headers,
        });
      }
    }
    throw error;
  }
}

