import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const GroupMemberModel = types
  .model("GroupMember")
  .props({
    user_id: types.optional(types.integer, 0),
    group_id: types.optional(types.integer, 0),
    avatar_id: types.optional(types.integer, 0),
    isOwner: types.optional(types.boolean, false),
    username: types.optional(types.string, ""),
    email: types.optional(types.string, ""),
    userSince: types.optional(types.string, ""),
    loads: types.optional(types.integer, 0),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface GroupMember extends Instance<typeof GroupMemberModel> { }
export interface GroupMemberSnapshotOut extends SnapshotOut<typeof GroupMemberModel> { }
export interface GroupMemberSnapshotIn extends SnapshotIn<typeof GroupMemberModel> { }
export const createGroupMemberDefaultModel = () => types.optional(GroupMemberModel, {})
