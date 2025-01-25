import { defineCase } from "@/utils";
import Ajv from "ajv/dist/jtd";

export default defineCase({
  name: 'ajv - jit',
  tests: {
    assertLoose: new Ajv().compile({
      properties: {
        number: { type: 'float64' },
        negNumber: { type: 'float64' },
        maxNumber: { type: 'float64' },
        string: { type: 'string' },
        longString: { type: 'string' },
        boolean: { type: 'boolean' },
        deeplyNested: {
          properties: {
            foo: { type: 'string' },
            num: { type: 'float64' },
            bool: { type: 'boolean' }
          }
        }
      }
    })
  }
});
