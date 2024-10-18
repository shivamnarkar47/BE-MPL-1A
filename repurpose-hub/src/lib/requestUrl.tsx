import axios from "axios"

const baseURL = "http://localhost:8000/"

type DataProps = {
    method: "GET"|"POST"|"PUT"|"PATCH"|"DELETE"
    endpoint: string
    data?: {}
}

export const requestUrl = (data:DataProps) => {
  return axios({
    method:data.method,
    url:baseURL+data.endpoint+"/",
    data: data?.data,

  })
}
