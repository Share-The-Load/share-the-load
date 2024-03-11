import { GroupSnapshotIn } from "app/models"

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
