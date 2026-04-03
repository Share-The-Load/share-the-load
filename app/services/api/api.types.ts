export interface ApiGenericResponse {
  status: string
  message: string
}

export interface ApiScheduleResponse {
  status: "success" | "partial"
  scheduledLoads?: string[]
  failedLoads?: string[]
}

export interface Preference {
  preference_id: number
  user_id: number
  day: string
  startTime: string
  endTime: string
  start_time: string
  end_time: string
}

export interface User {
  user_id: number
  username: string
  email: string
  avatar: number
  load_time: number
  onboarding_complete: boolean
  memberSince: string
  loads: number
  preferences: Preference[]
}

export interface GroupMember {
  user_id: number
  group_id: number
  avatar_id: number
  isOwner: boolean
  username: string
  email: string
  userSince: string
  loads: number
}

export interface Load {
  load_id: number
  user_id: number
  group_id: number
  start_time: string
  end_time: string
  load_type: string
  loadMember: GroupMember
}

export interface GroupDay {
  day?: string
  loads: Load[]
}

export interface Group {
  group_id: number
  name: string
  passcode: string
  hasPasscode: boolean
  numberOfMembers: number
  slogan: string
  totalLoads: number
  created_at: string
  owner_id: number
  ownerName: string
  avatar_id: number
  members: GroupMember[]
  groupLoadDays: GroupDay[]
}

export interface ApiGroupsResponse {
  groups: Group[]
}

export interface ApiGroupResponse {
  group: Group
}

export interface ApiLoadsResponse {
  days: GroupDay[]
}

export interface ApiFetchNewSloganResponse {
  slogan: string
}

export interface ApiInviteCodeResponse {
  inviteCode: string
}

export interface ApiJoinByInviteResponse {
  group?: Group
  requiresPasscode?: boolean
  groupId?: number
  groupName?: string
}

export interface LoadTypeCount {
  type: string
  count: number
}

export interface MemberLoadCount {
  username: string
  avatar_id: number
  count: number
}

export interface InsightsData {
  user: {
    totalLoads: number
    totalMinutes: number
    loadsByType: LoadTypeCount[]
  }
  group: {
    totalLoads: number
    totalMinutes: number
    loadsByType: LoadTypeCount[]
    loadsPerMember: MemberLoadCount[]
  }
}

export interface ApiConfig {
  url: string
  timeout: number
}
