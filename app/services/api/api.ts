
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig, ApiGroupResponse, ApiGenericResponse, ApiGroupsResponse, ApiFetchNewSloganResponse, ApiLoadsResponse } from "./api.types"
import { GroupDaySnapshotIn, GroupSnapshotIn, UserSnapshotIn } from "app/models"


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
    const response = await this.apisauce.post('/account/validate-token', { token })
    if (response.ok) {
      return response.data
    }
    else {
      throw new Error(`Error validating token: ${response}`)
    }
  }

  async refreshToken(token: string | undefined): Promise<any> {
    const response = await this.apisauce.post('/account/refresh-token', { refreshToken: token })
    if (response.ok) {
      return response.data
    }
    else {
      throw new Error(`Error refreshing token: ${response}`)
    }
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
    const response: ApiResponse<ApiGroupResponse> = await this.apisauce.post(`/create-group`, { name: groupName, passcode })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", group: response.data?.group }
  }

  async joinGroup(groupId: number, passcode: string): Promise<{ kind: "ok"; group: GroupSnapshotIn | undefined } | GeneralApiProblem> {
    const response: ApiResponse<ApiGroupResponse> = await this.apisauce.post(`/join-group`, { groupId, passcode })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", group: response.data?.group }
  }

  async getProfile(): Promise<{ kind: "ok"; profile: UserSnapshotIn } | GeneralApiProblem> {
    const response: ApiResponse<UserSnapshotIn> = await this.apisauce.get(`/profile`)
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    try {
      const rawData = response.data

      if (rawData && 'user_id' in rawData) {
        const profile: UserSnapshotIn = {
          ...rawData,
        }

        return { kind: "ok", profile }
      } else {
        throw new Error('user_id is missing in the response data');
      }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }

  }

  async updateLoadTime(loadTime: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<ApiGenericResponse> = await this.apisauce.post(`/update-load-time`, { loadTime })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok" };
  }

  async updatePreference(preference_id: number, start_time: string, end_time: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<ApiGenericResponse> = await this.apisauce.post(`/update-preference`, { preference_id, start_time, end_time })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok" };
  }

  async getGroupDetails(groupId: number | undefined): Promise<{ kind: "ok"; group: GroupSnapshotIn | undefined } | GeneralApiProblem> {
    const response: ApiResponse<ApiGroupResponse> = await this.apisauce.get(`/group-details/${groupId}`)
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", group: response.data?.group }
  }

  async leaveGroup(): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<ApiGenericResponse> = await this.apisauce.post(`/leave-group`)
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok" }
  }

  async removeMember(memberId: number | undefined): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<ApiGenericResponse> = await this.apisauce.post(`/remove-member`, { memberId })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok" }
  }

  async fetchNewSlogan(): Promise<{ kind: "ok", slogan: string | undefined } | GeneralApiProblem> {
    const response: ApiResponse<ApiFetchNewSloganResponse> = await this.apisauce.get(`/get-slogan`)
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok", slogan: response.data?.slogan }
  }

  async getLoadsHome(): Promise<{ kind: "ok", days: GroupDaySnapshotIn[] | undefined } | GeneralApiProblem> {
    const response: ApiResponse<ApiLoadsResponse> = await this.apisauce.get(`/group-loads`)
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok", days: response.data?.days }
  }

  async schedule(loads: any[], urgent: boolean): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<ApiGenericResponse> = await this.apisauce.post(`/schedule`, { loads, urgent })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok" }
  }

  async deleteLoad(loadId: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<ApiGenericResponse> = await this.apisauce.post(`/delete-load`, { loadId })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    if (response.data?.status === "error") {
      return { kind: "bad-data" }
    }
    return { kind: "ok" }
  }

  async editGroup(groupName: string, slogan: string, avatar_id: number, passcode: string | undefined): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<ApiGenericResponse> = await this.apisauce.post(`/edit-group`, { name: groupName, slogan, avatar_id, passcode })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok" }
  }

  async removeGroupPasscode(): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<ApiGenericResponse> = await this.apisauce.post(`/remove-passcode`)
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok" }
  }

  async editProfile(email: string, password: string, avatar_id: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<ApiGenericResponse> = await this.apisauce.post(`/edit-profile`, { password, email, avatar: avatar_id })
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok" }
  }

  async deleteAccount(): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<ApiGenericResponse> = await this.apisauce.post(`/account/delete-account`)
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    return { kind: "ok" }
  }

}
// Singleton instance of the API for convenience
export const api = new Api()
