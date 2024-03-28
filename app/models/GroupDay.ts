import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { LoadModel } from "./Load"

/**
 * Model description here for TypeScript hints.
 */
export const GroupDayModel = types
  .model("GroupDay")
  .props({
    day: types.maybe(types.string),
    loads: types.array(LoadModel),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get hasLoads() {
      return self.loads.length > 0;
    }

  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setLoads(loads: any) {
      self.loads = loads;
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface GroupDay extends Instance<typeof GroupDayModel> { }
export interface GroupDaySnapshotOut extends SnapshotOut<typeof GroupDayModel> { }
export interface GroupDaySnapshotIn extends SnapshotIn<typeof GroupDayModel> { }