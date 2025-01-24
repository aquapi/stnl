import { defineCase } from "@/utils";
import { boolean, number, object, string } from 'zod';

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
        })
      });

      return (o) => schema.safeParse(o).success;
    })()
  }
})
