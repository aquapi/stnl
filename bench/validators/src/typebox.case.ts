import { defineCase } from "@utils";

import { TypeSystemPolicy } from '@sinclair/typebox/system';
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

TypeSystemPolicy.AllowArrayObject = true;
TypeSystemPolicy.AllowNaN = true;

export default defineCase({
  name: '@sinclair/typebox',
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
        items: Type.Array(Type.Number())
      });

      return (o) => Value.Check(schema, o);
    })()
  }
})
