import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { UserStoreModel } from "./UserStore"
import { AuthenticationStoreModel } from "./AuthenticationStore"
import { GroupStoreModel } from "./GroupStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  userStore: types.optional(UserStoreModel, {} as any),
  authenticationStore: types.optional(AuthenticationStoreModel, {}),
  groupStore: types.optional(GroupStoreModel, { searchedGroups: [], yourGroup: {} }),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> { }
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> { }
