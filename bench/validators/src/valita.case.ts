import { defineCase } from "@utils";
import { array, boolean, number, object, string } from '@badrap/valita';

export default defineCase({
  name: '@badrap/valita',
  tests: {
    assertLoose: (() => {
      const schema = object({
        number: number(),
        negNumber: number(),
        maxNumber: number(),
        string: string(),
        longString: string(),
        boolean: boolean(),
        deeplyNested: object({
          foo: string(),
          num: number(),
          bool: boolean()
        }),
        items: array(number())
      });

      return (o) => schema.try(o).ok;
    })()
  }
})
