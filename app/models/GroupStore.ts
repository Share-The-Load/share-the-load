import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { GroupModel } from "./Group"

export const GroupStoreModel = types
  .model("GroupStore")
  .props({
    groups: types.array(GroupModel),
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    async searchGroupsByName(username: string, authtoken: string | undefined) {
      const response = await api.searchGroupsByName(username, authtoken)
      if (response.kind === "ok") {
        store.setProp("groups", response.groups)
      } else {
        console.error(`Error fetching groups: ${JSON.stringify(response)}`)
      }
    },
  }))
  .views((store) => ({
  }))
  .actions((store) => ({
  }))

export interface GroupStore extends Instance<typeof GroupStoreModel> { }
export interface GroupStoreSnapshot extends SnapshotOut<typeof GroupStoreModel> { }
