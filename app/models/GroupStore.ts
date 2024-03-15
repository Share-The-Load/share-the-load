import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { GroupModel } from "./Group"

export const GroupStoreModel = types
  .model("GroupStore")
  .props({
    searchedGroups: types.array(GroupModel),
    yourGroup: types.maybeNull(GroupModel),
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    async searchGroupsByName(username: string) {
      const response = await api.searchGroupsByName(username)
      if (response.kind === "ok") {
        store.setProp("searchedGroups", response.groups)
      } else {
        store.setProp("searchedGroups", [])
        console.error(`Error fetching groups: ${JSON.stringify(response)}`)
      }
    },
    async createGroup(groupName: string, passcode: string) {
      const response = await api.createGroup(groupName, passcode)
      if (response.kind === "ok") {
        store.setProp("yourGroup", response.group)
        return response.kind
      } else {
        throw new Error(`Error creating group: ${JSON.stringify(response)}`)
      }
    },
    async joinGroup(groupId: number, passcode: string) {
      const response = await api.joinGroup(groupId, passcode)
      if (response.kind === "ok") {
        store.setProp("yourGroup", response.group)
      } else {
        throw new Error(`Error joining group: ${JSON.stringify(response)}`)
      }
    },
    async getGroupDetails(groupId: number | undefined) {
      const response = await api.getGroupDetails(groupId)
      if (response.kind === "ok") {
        store.setProp("yourGroup", response.group)
      } else {
        throw new Error(`Error getting group details: ${JSON.stringify(response)}`)
      }
    },
    async leaveGroup() {
      const response = await api.leaveGroup()
      if (response.kind === "ok") {
        store.setProp("yourGroup", null)
      } else {
        throw new Error(`Error leaving group: ${JSON.stringify(response)}`)
      }
    },
    async removeMember(memberId: number) {
      const response = await api.removeMember(memberId)
      if (response.kind === "ok") {
        store.yourGroup?.removeMember(memberId)
      } else {
        throw new Error(`Error removing member: ${JSON.stringify(response)}`)
      }
    },
    async fetchNewSlogan() {
      const response = await api.fetchNewSlogan()
      if (response.kind === "ok") {
        return response.slogan
      } else {
        throw new Error(`Error fetching new slogan: ${JSON.stringify(response)}`)
      }
    },
    async getLoads() {
      const response = await api.getLoadsHome()
      if (response.kind === "ok" && response.days) {
        store.yourGroup?.addDays(response.days)
      }
      else {
        throw new Error(`Error fetching loads: ${JSON.stringify(response)}`)
      }
    }
  }))
  .views((store) => ({
    get hasGroups() {
      return store.searchedGroups.length > 0
    },
    get groupsSearchResults() {
      return store.searchedGroups
    },
    get yourGroupDetails() {
      return store.yourGroup
    },
    get yourGroupId() {
      return store.yourGroup?.group_id
    },

    get hasLoads() {
      const hasALoad = store.yourGroup?.groupLoadDays.some((day) => day.loads.length > 0)
      return hasALoad
    }
  }))
  .actions((store) => ({
  }))

export interface GroupStore extends Instance<typeof GroupStoreModel> { }
export interface GroupStoreSnapshot extends SnapshotOut<typeof GroupStoreModel> { }
