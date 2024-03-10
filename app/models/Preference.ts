import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const PreferenceModel = types
  .model("Preference")
  .props({
    preference_id: types.optional(types.integer, 0),
    user_id: types.optional(types.integer, 0),
    day: types.optional(types.string, ""),
    startTime: types.optional(types.string, ""),
    endTime: types.optional(types.string, ""),
    start_time: types.optional(types.string, ""),
    end_time: types.optional(types.string, ""),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Preference extends Instance<typeof PreferenceModel> { }
export interface PreferenceSnapshotOut extends SnapshotOut<typeof PreferenceModel> { }
export interface PreferenceSnapshotIn extends SnapshotIn<typeof PreferenceModel> { }
export const createPreferenceDefaultModel = () => types.optional(PreferenceModel, {})
