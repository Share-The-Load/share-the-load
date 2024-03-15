import { api } from "app/services/api"
import { Instance, SnapshotOut, types } from "mobx-state-tree"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
    refreshToken: types.maybe(types.string),
    userId: types.maybe(types.integer),
    userGroupId: types.maybe(types.integer),
    validated: types.optional(types.boolean, false),
  })
  .views((store) => ({
    get isAuthenticated() {
      return !!store.authToken
    },
    get hasGroup() {
      return !!store.userGroupId
    }
  }))
  .actions((store) => ({
    setAuthToken(value?: string) {
      store.authToken = value
    },
    setRefreshToken(value?: string) {
      store.refreshToken = value
    },
    setUserId(value?: number) {
      store.userId = value
    },
    setUserGroupId(value?: number) {
      store.userGroupId = value
    },
    setIsValidated(value: boolean) {
      store.validated = value
    },
    distributeAuthToken() {
      const token = store.authToken;
      api.apisauce.setHeader("Authorization", `Bearer ${token}`);
    },
    async validateAndRefreshToken() {
      if (!store.authToken || store.validated) {
        return
      }
      console.log(`❗️❗️❗️ Checking Auth Token`, store.authToken)
      await api.validateToken(store.authToken).catch(async (error) => {
        console.error(`Error validating token: ${error}`)
        console.log(`❗️❗️❗️ REFRESH TOKEN`, store.refreshToken)
        await api.refreshToken(store.refreshToken).catch((error: any) => {
          console.error(`Error refreshing token: ${error}`)
          this.logout()
        }).then((response: any) => {
          console.log(`❗️❗️❗️ response REFRESH`, response)
          this.setAuthToken(response.token)
          this.setRefreshToken(response.refreshToken)
          this.setIsValidated(true)
          this.distributeAuthToken()
        })
      }).then((response: any) => {
        api.apisauce.setHeader("Authorization", `Bearer ${store.authToken}`);
        console.log(`❗️❗️❗️ TOKEN HAS BEEN VALIDATED. WE"RE GOOD`, response)
        this.setIsValidated(true)
      })
    },
    logout() {
      store.authToken = undefined
      store.userId = undefined
      store.userGroupId = undefined
      store.validated = false
    },
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> { }
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> { }
