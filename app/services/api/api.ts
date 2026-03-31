import axios, { AxiosInstance, AxiosError } from "axios"
import Config from "../../config"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type {
  ApiConfig,
  ApiGroupResponse,
  ApiGenericResponse,
  ApiGroupsResponse,
  ApiFetchNewSloganResponse,
  ApiLoadsResponse,
  Group,
  GroupDay,
  User,
} from "./api.types"

export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

export class Api {
  axios: AxiosInstance
  config: ApiConfig

  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.axios = axios.create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: { Accept: "application/json" },
    })
  }

  setHeader(key: string, value: string) {
    this.axios.defaults.headers.common[key] = value
  }

  private async request<T>(method: "get" | "post", url: string, data?: any): Promise<{ ok: true; data: T } | { ok: false; problem: GeneralApiProblem }> {
    try {
      const response = method === "get"
        ? await this.axios.get<T>(url)
        : await this.axios.post<T>(url, data)
      return { ok: true, data: response.data }
    } catch (e) {
      const problem = getGeneralApiProblem(e as AxiosError)
      return { ok: false, problem }
    }
  }

  async validateToken(token: string | undefined): Promise<any> {
    const result = await this.request("post", "/account/validate-token", { token })
    if (result.ok) return result.data
    throw new Error(`Error validating token`)
  }

  async refreshToken(token: string | undefined): Promise<any> {
    const result = await this.request("post", "/account/refresh-token", { refreshToken: token })
    if (result.ok) return result.data
    throw new Error(`Error refreshing token`)
  }

  async searchGroupsByName(groupName: string): Promise<{ kind: "ok"; groups: Group[] } | GeneralApiProblem> {
    const result = await this.request<ApiGroupsResponse>("get", `/groups/${groupName}`)
    if (!result.ok) return result.problem
    try {
      const groups: Group[] = result.data?.groups ?? []
      return { kind: "ok", groups }
    } catch (e) {
      if (__DEV__ && e instanceof Error) console.error(`Bad data: ${e.message}\n${result.data}`, e.stack)
      return { kind: "bad-data" }
    }
  }

  async createGroup(groupName: string, passcode: string): Promise<{ kind: "ok"; group: Group | undefined } | GeneralApiProblem> {
    const result = await this.request<ApiGroupResponse>("post", `/create-group`, { name: groupName, passcode })
    if (!result.ok) return result.problem
    return { kind: "ok", group: result.data?.group }
  }

  async joinGroup(groupId: number, passcode: string): Promise<{ kind: "ok"; group: Group | undefined } | GeneralApiProblem> {
    const result = await this.request<ApiGroupResponse>("post", `/join-group`, { groupId, passcode })
    if (!result.ok) return result.problem
    return { kind: "ok", group: result.data?.group }
  }

  async getProfile(): Promise<{ kind: "ok"; profile: User } | GeneralApiProblem> {
    const result = await this.request<User>("get", `/profile`)
    if (!result.ok) return result.problem
    try {
      const rawData = result.data
      if (rawData && "user_id" in rawData) return { kind: "ok", profile: rawData }
      throw new Error("user_id is missing in the response data")
    } catch (e) {
      if (__DEV__ && e instanceof Error) console.error(`Bad data: ${e.message}\n${result.data}`, e.stack)
      return { kind: "bad-data" }
    }
  }

  async updateLoadTime(loadTime: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const result = await this.request<ApiGenericResponse>("post", `/update-load-time`, { loadTime })
    if (!result.ok) return result.problem
    return { kind: "ok" }
  }

  async updatePreference(preference_id: number, start_time: string, end_time: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const result = await this.request<ApiGenericResponse>("post", `/update-preference`, { preference_id, start_time, end_time })
    if (!result.ok) return result.problem
    return { kind: "ok" }
  }

  async getGroupDetails(groupId: number | undefined): Promise<{ kind: "ok"; group: Group | undefined } | GeneralApiProblem> {
    const result = await this.request<ApiGroupResponse>("get", `/group-details/${groupId}`)
    if (!result.ok) return result.problem
    return { kind: "ok", group: result.data?.group }
  }

  async leaveGroup(): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const result = await this.request<ApiGenericResponse>("post", `/leave-group`)
    if (!result.ok) return result.problem
    return { kind: "ok" }
  }

  async removeMember(memberId: number | undefined): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const result = await this.request<ApiGenericResponse>("post", `/remove-member`, { memberId })
    if (!result.ok) return result.problem
    return { kind: "ok" }
  }

  async fetchNewSlogan(): Promise<{ kind: "ok"; slogan: string | undefined } | GeneralApiProblem> {
    const result = await this.request<ApiFetchNewSloganResponse>("get", `/get-slogan`)
    if (!result.ok) return result.problem
    return { kind: "ok", slogan: result.data?.slogan }
  }

  async getLoadsHome(): Promise<{ kind: "ok"; days: GroupDay[] | undefined } | GeneralApiProblem> {
    const result = await this.request<ApiLoadsResponse>("get", `/group-loads`)
    if (!result.ok) return result.problem
    return { kind: "ok", days: result.data?.days }
  }

  async schedule(loads: any[], urgent: boolean): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const result = await this.request<ApiGenericResponse>("post", `/schedule`, { loads, urgent })
    if (!result.ok) return result.problem
    return { kind: "ok" }
  }

  async deleteLoad(loadId: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const result = await this.request<ApiGenericResponse>("post", `/delete-load`, { loadId })
    if (!result.ok) return result.problem
    if (result.data?.status === "error") return { kind: "bad-data" }
    return { kind: "ok" }
  }

  async editGroup(groupName: string, slogan: string, avatar_id: number, passcode: string | undefined): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const result = await this.request<ApiGenericResponse>("post", `/edit-group`, { name: groupName, slogan, avatar_id, passcode })
    if (!result.ok) return result.problem
    return { kind: "ok" }
  }

  async removeGroupPasscode(): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const result = await this.request<ApiGenericResponse>("post", `/remove-passcode`)
    if (!result.ok) return result.problem
    return { kind: "ok" }
  }

  async editProfile(email: string, password: string, avatar_id: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const result = await this.request<ApiGenericResponse>("post", `/edit-profile`, { password, email, avatar: avatar_id })
    if (!result.ok) return result.problem
    return { kind: "ok" }
  }

  async deleteAccount(): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const result = await this.request<ApiGenericResponse>("post", `/account/delete-account`)
    if (!result.ok) return result.problem
    return { kind: "ok" }
  }
}

export const api = new Api()
