import { GroupSnapshotIn, LoadSnapshotIn } from "app/models"

export interface ApiGenericResponse {
  status: string
  message: string
}

export interface ApiGroupsResponse {
  groups: GroupSnapshotIn[]
}

export interface ApiGroupResponse {
  group: GroupSnapshotIn
}

export interface ApiGenericResponse {
  status: string
  message: string
}

export interface ApiLoadsResponse {
  days: [
    day: string,
    loads: LoadSnapshotIn[]
  ]

}

export interface ApiFetchNewSloganResponse {
  slogan: string
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}
