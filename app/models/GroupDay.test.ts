import { GroupDayModel } from "./GroupDay"

test("can be created", () => {
  const instance = GroupDayModel.create({})

  expect(instance).toBeTruthy()
})
