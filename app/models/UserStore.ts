import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { navigate } from "app/navigators"
import { api } from "app/services/api"
import { UserModel } from "./User"

export const UserStoreModel = types
  .model("UserStore")
  .props({
    user: types.maybe(UserModel),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get profile() {
      return self.user
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async getProfile() {
      const response = await api.getProfile()
      if (response.kind === "ok") {
        self.setProp("user", response.profile)
      } else {
        console.error(`Error fetching profile: ${JSON.stringify(response)}`)
      }
    },
    async updateLoadTime(loadTime: number) {
      const response = await api.updateLoadTime(loadTime)
      if (response.kind === "ok") {
        self.profile?.updateLoadTime(loadTime)
      } else {
        throw new Error(`Error updating load time: ${JSON.stringify(response)}`)
      }
    },
    async updatePreference(preference_id: number, start_time: string, end_time: string) {
      const response = await api.updatePreference(preference_id, start_time, end_time)
      if (response.kind === "ok") {
        self.profile?.updatePreference(preference_id, start_time, end_time)
      } else {
        throw new Error(`Error updating preference: ${JSON.stringify(response)}`)
      }
    },
    async editProfile(email: string, newPassword: string, avatar: number) {
      const response = await api.editProfile(email, newPassword, avatar)
      if (response.kind === "ok") {
        self.profile?.updateAvatar(avatar)
        self.profile?.updateEmail(email)
        return response
      } else {
        throw new Error(`Error updating profile: ${JSON.stringify(response)}`)
      }
    },
    async deleteAccount() {
      const response = await api.deleteAccount()
      if (response.kind === "ok") {
        return response
      } else {
        throw new Error(`Error deleting account: ${JSON.stringify(response)}`)
      }
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface UserStore extends Instance<typeof UserStoreModel> { }
export interface UserStoreSnapshotOut extends SnapshotOut<typeof UserStoreModel> { }
