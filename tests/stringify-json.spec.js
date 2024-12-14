import { test, expect } from 'bun:test';
import stringifyJson from '../lib/compilers/stringify-json';

function build(schema) {
  const builder = [];
  const decls = [];

  stringifyJson(schema, 'o', builder, decls);

  // eslint-disable-next-line
  return Function(`${decls.map((decl, i) => `'use strict';var d${i + 1}=${decl.join('')};`).join('')}return (o)=>${builder.join('')};`)();
}

function createTest(label, schema, tests) {
  test(label, () => {
    const fn = build(schema);
    console.log(fn.toString());
    for (const i of tests) expect(fn(i)).toBe(JSON.stringify(i));
  });
}

createTest('Primitives', { type: 'int' }, [9, 16, 25, 90]);
createTest('Objects', {
  props: {
    name: { type: 'string' },
    age: { type: 'int' }
  }
}, [ { name: 'admin', age: 20 } ]);
