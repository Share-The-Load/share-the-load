import { GroupModel } from "./Group"

test("can be created", () => {
  const instance = GroupModel.create({})

  expect(instance).toBeTruthy()
})
