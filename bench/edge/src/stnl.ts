import stnl from 'stnl';
import compose from 'stnl/compilers/validate-json/compose';

import defineCase from '../defineCase';

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

      return compose(schema);
    })()
  }
});
