import { defineCase } from "@/utils";
import { array, boolean, number, object, string } from 'zod';

export default defineCase({
  name: 'zod',
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

      return (o) => schema.safeParse(o).success;
    })()
  }
})
