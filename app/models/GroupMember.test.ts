import { GroupMemberModel } from "./GroupMember"

test("can be created", () => {
  const instance = GroupMemberModel.create({})

  expect(instance).toBeTruthy()
})
