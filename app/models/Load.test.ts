import { LoadModel } from "./Load"

test("can be created", () => {
  const instance = LoadModel.create({})

  expect(instance).toBeTruthy()
})
