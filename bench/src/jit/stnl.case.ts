import stnl from 'stnl';
import { build } from 'stnl/compilers/validate-json';

import defineCase from '../../defineCase';

export default defineCase({
  name: 'stnl - jit',
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
