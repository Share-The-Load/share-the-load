import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { PreferenceModel } from "./Preference"
import { Titles } from "app/constants/titles"

/**
 * Model description here for TypeScript hints.
 */
export const UserModel = types
  .model("User")
  .props({
    user_id: types.identifierNumber,
    username: "",
    email: "",
    avatar: 0,
    load_time: 60,
    memberSince: "",
    loads: 15,
    preferences: types.array(PreferenceModel),
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
    },
    updateAvatar(avatar: number) {
      self.avatar = avatar
    },
    updateEmail(email: string) {
      self.email = email
    }

  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface User extends Instance<typeof UserModel> { }
export interface UserSnapshotOut extends SnapshotOut<typeof UserModel> { }
export interface UserSnapshotIn extends SnapshotIn<typeof UserModel> { }
