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
    group_id: types.identifierNumber,
    name: "",
    passcode: "",
    hasPasscode: false,
    numberOfMembers: 0,
    slogan: "",
    totalLoads: 0,
    created_at: "",
    owner_id: 0,
    ownerName: "",
    avatar_id: 1,
    members: types.array(GroupMemberModel),
    groupLoadDays: types.array(GroupDayModel),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get memberCount(): number {
      if (self.members === undefined) {
        return 0;
      }
      else return self.members.length;
    },
    get hasMoreThanOneMember(): boolean {
      if (self.members === undefined)
        return false;
      else
        return self.members?.length > 1;
    },
    get transferMember() {
      if (self.members === undefined)
        return;
      if (self.members.length > 1)
        return self.members[1];
      else
        return
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    removeMember(memberId: number | undefined) {
      const newMembers = self.members.filter((member) => member.user_id !== memberId);
      self.members.replace(newMembers);
    },
    addDays(days: GroupDaySnapshotIn[]) {
      self.groupLoadDays.clear();
      self.groupLoadDays.push(...days);
    },
    removePasscode() {
      self.hasPasscode = false;
      self.passcode = "";
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Group extends Instance<typeof GroupModel> { }
export interface GroupSnapshotOut extends SnapshotOut<typeof GroupModel> { }
export interface GroupSnapshotIn extends SnapshotIn<typeof GroupModel> { }
