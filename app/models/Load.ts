import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { GroupMemberModel } from "./GroupMember"
import moment from 'moment'
/**
 * Model description here for TypeScript hints.
 */
export const LoadModel = types
  .model("Load")
  .props({
    load_id: types.identifierNumber,
    user_id: 0,
    group_id: 0,
    start_time: "",
    end_time: "",
    load_type: "",
    loadMember: GroupMemberModel
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get loadTime() {
      const start = moment(self.start_time).format('h:mm A')
      const end = moment(self.end_time).format('h:mm A')
      return `${start} - ${end}`
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Load extends Instance<typeof LoadModel> { }
export interface LoadSnapshotOut extends SnapshotOut<typeof LoadModel> { }
export interface LoadSnapshotIn extends SnapshotIn<typeof LoadModel> { }
