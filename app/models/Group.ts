import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const GroupModel = types
  .model("Group")
  .props({
    name: types.optional(types.string, ""),
    passcode: types.optional(types.string, ""),
    slogan: types.optional(types.string, ""),
    created_at: types.optional(types.string, ""),
    // owner:
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Group extends Instance<typeof GroupModel> { }
export interface GroupSnapshotOut extends SnapshotOut<typeof GroupModel> { }
export interface GroupSnapshotIn extends SnapshotIn<typeof GroupModel> { }
export const createGroupDefaultModel = () => types.optional(GroupModel, {})
