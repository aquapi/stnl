import { defineCase } from "@/utils";

import { Validator } from 'jsonschema';
import { Type } from '@sinclair/typebox';

const v = new Validator();

export default defineCase({
  name: 'jsonschema',
  tests: {
    assertLoose: (() => {
      const schema = Type.Object({
        number: Type.Number(),
        negNumber: Type.Number(),
        maxNumber: Type.Number(),
        string: Type.String(),
        longString: Type.String(),
        boolean: Type.Boolean(),
        deeplyNested: Type.Object({
          foo: Type.String(),
          num: Type.Number(),
          bool: Type.Boolean(),
        }),
      });

      return (o) => v.validate(o, schema).valid;
    })()
  }
})
