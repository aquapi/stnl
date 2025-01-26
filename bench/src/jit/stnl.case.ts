import { defineCase } from "@/utils";
import { build as buildValidateJson } from 'stnl/compilers/validate-json';
import { build as buildStringifyJson } from 'stnl/compilers/stringify-json';

export default defineCase({
  name: 'stnl - jit',
  tests: {
    assertLoose: buildValidateJson({
      props: {
        number: 'f64',
        negNumber: 'f64',
        maxNumber: 'f64',
        string: 'string',
        longString: 'string',
        boolean: 'bool',
        deeplyNested: {
          props: {
            foo: 'string',
            num: 'f64',
            bool: 'bool'
          }
        },
        items: { item: 'f64' }
      }
    }),

    stringify: buildStringifyJson({
      props: {
        name: 'string',
        pwd: 'string',
        id: { item: 'f64' }
      }
    })
  }
});
