import { defineCase } from "@/utils";

import stnl from 'stnl';
import build from 'stnl/compilers/validate-json/compose';

export default defineCase({
  name: 'stnl',
  tests: {
    assertLoose: (() => {
      const schema = stnl({
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
          }
        }
      });

      return build(schema);
    })()
  }
});
