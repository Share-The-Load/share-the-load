import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { GroupModel } from "./Group"

export const GroupStoreModel = types
  .model("GroupStore")
  .props({
    groups: types.array(GroupModel),
    yourGroup: types.maybeNull(GroupModel),
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    async searchGroupsByName(username: string) {
      const response = await api.searchGroupsByName(username)
      if (response.kind === "ok") {
        store.setProp("groups", response.groups)
      } else {
        store.setProp("groups", [])
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
    }
  }))
  .views((store) => ({
    get hasGroups() {
      return store.groups.length > 0
    },
    get groupsSearchResults() {
      return store.groups
    },
    get yourGroupDetails() {
      return store.yourGroup
    },
    get yourGroupId() {
      return store.yourGroup?.group_id
    }
  }))
  .actions((store) => ({
  }))

export interface GroupStore extends Instance<typeof GroupStoreModel> { }
export interface GroupStoreSnapshot extends SnapshotOut<typeof GroupStoreModel> { }
