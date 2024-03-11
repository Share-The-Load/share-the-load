
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig, ApiCreateGroupResponse, ApiGroupsResponse } from "./api.types"
import { GroupSnapshotIn } from "app/models"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }

  async validateToken(token: string | undefined): Promise<any> {
    this.apisauce.setHeader('Authorization', `Bearer ${token}`)
    return this.apisauce.post('/account/validate-token', { token })
  }

  async refreshToken(token: string | undefined): Promise<any> {
    this.apisauce.setHeader('Authorization', `Bearer ${token}`)
    return this.apisauce.post('/account/refresh-token', { token })
  }

  async searchGroupsByName(groupName: string): Promise<{ kind: "ok"; groups: GroupSnapshotIn[] } | GeneralApiProblem> {
    const response: ApiResponse<ApiGroupsResponse> = await this.apisauce.get(`/groups/${groupName}`)
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const rawData = response.data

      const groups: GroupSnapshotIn[] =
        rawData?.groups.map((raw) => ({
          ...raw,
        })) ?? []

      return { kind: "ok", groups }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async createGroup(groupName: string, passcode: string): Promise<{ kind: "ok"; group: GroupSnapshotIn | undefined } | GeneralApiProblem> {
    const response: ApiResponse<ApiCreateGroupResponse> = await this.apisauce.post(`/create-group`, { name: groupName, passcode })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", group: response.data?.group }
  }

  async joinGroup(groupId: number, passcode: string): Promise<{ kind: "ok"; group: GroupSnapshotIn | undefined } | GeneralApiProblem> {
    const response: ApiResponse<ApiCreateGroupResponse> = await this.apisauce.post(`/join-group`, { groupId, passcode })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", group: response.data?.group }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
