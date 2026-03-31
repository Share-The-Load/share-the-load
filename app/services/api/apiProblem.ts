import { AxiosError, AxiosResponse } from "axios"

export type GeneralApiProblem =
  | { kind: "timeout"; temporary: true }
  | { kind: "cannot-connect"; temporary: true }
  | { kind: "server" }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "not-found" }
  | { kind: "rejected" }
  | { kind: "unknown"; temporary: true }
  | { kind: "bad-data" }

export function getGeneralApiProblem(error: AxiosError): GeneralApiProblem {
  if (error.code === "ECONNABORTED") {
    return { kind: "timeout", temporary: true }
  }

  if (!error.response) {
    return { kind: "cannot-connect", temporary: true }
  }

  const status = error.response.status
  if (status >= 500) return { kind: "server" }
  if (status === 401) return { kind: "unauthorized" }
  if (status === 403) return { kind: "forbidden" }
  if (status === 404) return { kind: "not-found" }
  if (status >= 400) return { kind: "rejected" }

  return { kind: "unknown", temporary: true }
}
