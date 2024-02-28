import { api } from "app/services/api"
import { Instance, SnapshotOut, types } from "mobx-state-tree"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
    refreshToken: types.maybe(types.string),
    userId: types.maybe(types.integer),
    userGroupId: types.maybe(types.integer),
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
    distributeAuthToken() {
      const token = store.authToken;
      api.apisauce.setHeader("Authorization", `Bearer ${token}`);
    },
    async validateAndRefreshToken() {
      //TODO: This is not done
      console.log(`❗️❗️❗️ AUUTH`, store.authToken)
      const response = await api.validateToken(store.authToken).catch((error) => {
        console.error(`Error validating token: ${error}`)
        // const refreshToken = api.refreshToken(token).catch((error: any) => {
        //   console.error(`Error refreshing token: ${error}`)
        // }).then((response: string) => {
        //   console.log(`❗️❗️❗️ response`, response)
        //   // store.authToken(response.token)
        // })
      }).then((response: any) => {
        if (response.status === 403) {
          //I think this means they are expired and need to login again
          console.log(`❗️❗️❗️ hser`,)
          const refreshToken = api.refreshToken(store.authToken).catch((error: any) => {
            console.error(`Error refreshing token: ${error}`)
          }).then((response: any) => {
            console.log(`❗️❗️❗️ response REFRESH`, response)
            // this.setAuthToken(response.token)
            // this.distributeAuthToken()
          })
        }
        console.log(`❗️❗️❗️ response VALIDATE`, response)
      })
    },
    logout() {
      store.authToken = undefined
      store.userId = undefined
      store.userGroupId = undefined
    },
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> { }
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> { }
