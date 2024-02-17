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
import type { ApiConfig, ApiFeedResponse, ApiGroupsResponse } from "./api.types"
import type { EpisodeSnapshotIn } from "../../models/Episode"
import { GroupSnapshotIn } from "app/models"

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
    this.apisauce.setHeader('Authorization', `Bearer ${token}`)
    return this.apisauce.post('/account/validate_token', { token })
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

  async searchGroupsByName(groupName: string, authToken: string | undefined): Promise<{ kind: "ok"; groups: GroupSnapshotIn[] } | GeneralApiProblem> {
    // make the api call
    console.log(`❗️❗️❗️ validating token`,)
    // const validateToken = await this.validateToken(authToken).catch((err) => {
    //   console.log(`❗️❗️❗️ Token not valid`, err)
    //   localStorage.removeItem('token');
    //   this.apisauce.post('/account/refresh-token', { token }).then((res) => {
    //     console.log(`❗️❗️❗️ Refreshed TOken`, res)
    //     localStorage.setItem('token', res.data.token);
    //     this.apisauce.setHeader('Authorization', `Bearer ${res.data.token}`)
    //   })
    // }
    // console.log(`❗️❗️❗️ validated`, validateToken)

    this.apisauce.setHeader('Authorization', `Bearer ${authToken}`)
    const response: ApiResponse<ApiGroupsResponse> = await this.apisauce.get(`/groups/${groupName}`)

    console.log(`❗️❗️❗️ response`, response)

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      // This is where we transform the data into the shape we expect for our MST model.
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

}

// Singleton instance of the API for convenience
export const api = new Api()
