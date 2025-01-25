import buildAssert from 'stnl/compilers/validate-json';
import type { TSchema } from 'stnl';

const schemas: Record<string, TSchema> = {
  assertLoose: {
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
  }
}

const OUTDIR = import.meta.dir + '/../lib/';

for (const key in schemas) {
  const schema = schemas[key];

  const decls: string[] = [];
  const content = buildAssert(schema, 'o', decls);

  Bun.write(OUTDIR + key + '.ts', `export default (()=>{${decls.map((decl, i) => `var d${i + 1}=${decl};`).join('')}return (o)=>${content};})();`);
}
