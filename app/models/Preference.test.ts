import { PreferenceModel } from "./Preference"

test("can be created", () => {
  const instance = PreferenceModel.create({})

  expect(instance).toBeTruthy()
})
