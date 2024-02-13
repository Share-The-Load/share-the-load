import { Instance, SnapshotOut, types } from "mobx-state-tree"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
    userId: types.maybe(types.integer),
    userGroup: types.maybe(types.integer),
  })
  .views((store) => ({
    get isAuthenticated() {
      return !!store.authToken
    },

    get hasGroup() {
      return !!store.userGroup
    }
  }))
  .actions((store) => ({
    setAuthToken(value?: string) {
      store.authToken = value
    },
    setUserId(value?: number) {
      store.userId = value
    },
    setUserGroup(value?: number) {
      store.userGroup = value
    },
    logout() {
      store.authToken = undefined
      store.userId = undefined
      store.userGroup = undefined
    },
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> { }
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> { }
