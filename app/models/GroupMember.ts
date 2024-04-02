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
      if (self.loads < 1) return "No Load Joe";
      const title = Titles.find((t) => self.loads < t.loads)?.title;
      return title || Titles[Titles.length - 1].title;
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    updateAvatar(avatar: number) {
      self.avatar_id = avatar
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface GroupMember extends Instance<typeof GroupMemberModel> { }
export interface GroupMemberSnapshotOut extends SnapshotOut<typeof GroupMemberModel> { }
export interface GroupMemberSnapshotIn extends SnapshotIn<typeof GroupMemberModel> { }
