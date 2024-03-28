import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { Titles } from "app/constants/titles"

/**
 * Model description here for TypeScript hints.
 */
export const GroupMemberModel = types
  .model("GroupMember")
  .props({
    user_id: types.identifierNumber,
    group_id: 0,
    avatar_id: 0,
    isOwner: false,
    username: "",
    email: "",
    userSince: "",
    loads: 0,
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get profileTitle() {
      if (self.loads === 0) return "No Load Joe"
      return Titles.reverse().find((title) =>
        self.loads >= title.loads
      )?.title
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface GroupMember extends Instance<typeof GroupMemberModel> { }
export interface GroupMemberSnapshotOut extends SnapshotOut<typeof GroupMemberModel> { }
export interface GroupMemberSnapshotIn extends SnapshotIn<typeof GroupMemberModel> { }
