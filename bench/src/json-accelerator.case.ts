import { defineCase } from "@/utils";

import { TypeSystemPolicy } from '@sinclair/typebox/system';
import { Type } from '@sinclair/typebox';
import { createAccelerator } from 'json-accelerator';

TypeSystemPolicy.AllowArrayObject = true;
TypeSystemPolicy.AllowNaN = true;

export default defineCase({
  name: 'json-accelerator',
  tests: {
    stringify: createAccelerator(
      Type.Array(Type.Object({
        name: Type.String(),
        pwd: Type.String(),
        id: Type.Array(Type.Number())
      }))
    )
  }
})
