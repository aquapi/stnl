import { defineCase } from "@/utils";

import { TypeSystemPolicy } from '@sinclair/typebox/system';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Type } from '@sinclair/typebox';

TypeSystemPolicy.AllowArrayObject = true;
TypeSystemPolicy.AllowNaN = true;

export default defineCase({
  name: '@sinclair/typebox - jit',
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

      const f = TypeCompiler.Compile(schema);
      return (o) => f.Check(o);
    })()
  }
})
