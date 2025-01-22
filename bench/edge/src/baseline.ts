import stnl, { type TSchema } from 'stnl';
import { build } from 'stnl/compilers/validate-json';

import defineCase from '../defineCase';

/**
 * Compare with a JITed implementation
 */
export default defineCase({
  name: 'baseline',
  tests: {
    assertLoose: (() => {
      const schema = stnl({
        props: {
          number: { type: 'float' },
          negNumber: { type: 'float' },
          maxNumber: { type: 'float' },
          string: { type: 'string' },
          longString: { type: 'string' },
          boolean: { type: 'bool' },
          deeplyNested: {
            props: {
              foo: { type: 'string' },
              num: { type: 'float' },
              bool: { type: 'bool' }
            }
          }
        }
      });

      return build(schema);
    })()
  }
});
