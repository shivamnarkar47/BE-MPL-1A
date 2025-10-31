import axios, { AxiosResponse } from "axios"

const baseURL = "http://localhost:8000/"

type DataProps = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  endpoint: string
  data?: {}
  responseType?: "json" | "blob" | "text" | "arraybuffer" // ✅ optional
}

export const requestUrl = async <T = any>(data: DataProps): Promise<AxiosResponse<T>> => {
  return axios({
    method: data.method,
    url: `${baseURL}${data.endpoint}/`,
    data: data?.data,
    responseType: data?.responseType || "json", // ✅ defaults to JSON
  })
}
