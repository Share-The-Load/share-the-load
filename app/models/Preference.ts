import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const PreferenceModel = types
  .model("Preference")
  .props({
    preference_id: types.identifierNumber,
    user_id: 0,
    day: "",
    startTime: "",
    endTime: "",
    start_time: "",
    end_time: ""
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Preference extends Instance<typeof PreferenceModel> { }
export interface PreferenceSnapshotOut extends SnapshotOut<typeof PreferenceModel> { }
export interface PreferenceSnapshotIn extends SnapshotIn<typeof PreferenceModel> { }
