import { GroupSnapshotIn } from "app/models"

export interface ApiGenericResponse {
  status: string
  message: string
}

export interface ApiGroupsResponse {
  groups: GroupSnapshotIn[]
}

export interface ApiCreateGroupResponse {
  group: GroupSnapshotIn
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
