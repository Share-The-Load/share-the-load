import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { GroupMemberModel } from "./GroupMember"
import { GroupDayModel, GroupDaySnapshotIn } from "./GroupDay";

/**
 * Model description here for TypeScript hints.
 */
export const GroupModel = types
  .model("Group")
  .props({
    group_id: types.optional(types.integer, 0),
    name: types.optional(types.string, ""),
    passcode: types.optional(types.string, ""),
    hasPasscode: types.optional(types.boolean, false),
    numberOfMembers: types.optional(types.integer, 0),
    slogan: types.optional(types.string, ""),
    totalLoads: types.optional(types.integer, 0),
    created_at: types.optional(types.string, ""),
    owner_id: types.optional(types.integer, 0),
    ownerName: types.optional(types.string, ""),
    avatar_id: types.maybe(types.integer),
    members: types.optional(types.array(GroupMemberModel), []),
    groupLoadDays: types.optional(types.array(GroupDayModel), []),
  })
  .actions(withSetPropAction)
  .views((self) => ({

  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    removeMember(memberId: number) {
      const newMembers = self.members.filter((member) => member.user_id !== memberId);
      self.members.replace(newMembers);
    },
    addDays(days: GroupDaySnapshotIn[]) {
      self.groupLoadDays.clear();
      self.groupLoadDays.push(...days);
    }
    // addLoad(load: LoadSnapshotIn) {
    //   self.groupLoadDays.find((day) => day.day === load.time_start)?.addLoad(load);
    // },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Group extends Instance<typeof GroupModel> { }
export interface GroupSnapshotOut extends SnapshotOut<typeof GroupModel> { }
export interface GroupSnapshotIn extends SnapshotIn<typeof GroupModel> { }
export const createGroupDefaultModel = () => types.optional(GroupModel, {})
