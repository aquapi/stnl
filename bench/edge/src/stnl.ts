import stnl from 'stnl';
import compose from 'stnl/compilers/validate-json/compose';

import defineCase from '../defineCase';

export default defineCase({
  name: 'stnl',
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

      return compose(schema);
    })()
  }
});
