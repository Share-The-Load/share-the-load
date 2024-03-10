import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { PreferenceModel } from "./Preference"

/**
 * Model description here for TypeScript hints.
 */
export const UserModel = types
  .model("User")
  .props({
    user_id: types.optional(types.integer, 0),
    username: types.optional(types.string, ""),
    email: types.optional(types.string, ""),
    avatar: types.optional(types.integer, 0),
    load_time: types.optional(types.integer, 60),
    loadsCompleted: types.optional(types.integer, 0),
    memberSince: types.optional(types.string, ""),
    loads: types.optional(types.integer, 0),
    preferences: types.optional(types.array(PreferenceModel), []),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    updateLoadTime(value?: number) {
      if (value !== undefined) {
        self.load_time = value
      }
    },
    updatePreference(preference_id: number, start_time: string, end_time: string) {
      const preference = self.preferences.find((p) => p.preference_id === preference_id)
      if (preference) {
        preference.start_time = start_time
        preference.end_time = end_time
      }
    }

  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface User extends Instance<typeof UserModel> { }
export interface UserSnapshotOut extends SnapshotOut<typeof UserModel> { }
export interface UserSnapshotIn extends SnapshotIn<typeof UserModel> { }
export const createUserDefaultModel = () => types.optional(UserModel, {})
