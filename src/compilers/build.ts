import type { TSchema } from '..';

export default (schema: TSchema, f: (x: TSchema, id: string, decls: string[]) => string): (...args: any[]) => any => {
  const decls: string[] = [];
  const content = f(schema, 'o', decls);

  // eslint-disable-next-line
  return Function(`'use strict';${decls.map((decl, i) => `var d${i + 1}=${decl};`).join('')}return (o)=>${content};`)();
};
