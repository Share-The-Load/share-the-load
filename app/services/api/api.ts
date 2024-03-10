/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://github.com/infinitered/ignite/blob/master/docs/Backend-API-Integration.md)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig, ApiCreateGroupResponse, ApiFeedResponse, ApiGenericResponse, ApiGroupsResponse } from "./api.types"
import type { EpisodeSnapshotIn } from "../../models/Episode"
import { GroupSnapshotIn, UserSnapshotIn } from "app/models"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
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

  /**
   * Gets a list of recent React Native Radio episodes.
   */
  async getEpisodes(): Promise<{ kind: "ok"; episodes: EpisodeSnapshotIn[] } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
      `api.json?rss_url=https%3A%2F%2Ffeeds.simplecast.com%2FhEI_f9Dx`,
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      // This is where we transform the data into the shape we expect for our MST model.
      const episodes: EpisodeSnapshotIn[] =
        rawData?.items.map((raw) => ({
          ...raw,
        })) ?? []

      return { kind: "ok", episodes }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
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

  async getProfile(): Promise<{ kind: "ok"; profile: UserSnapshotIn | undefined } | GeneralApiProblem> {
    const response: ApiResponse<UserSnapshotIn> = await this.apisauce.get(`/profile`)
    console.log(`❗️❗️❗️ APIS`, response)
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", profile: response.data }
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
}
// Singleton instance of the API for convenience
export const api = new Api()
