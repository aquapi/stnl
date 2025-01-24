import type { TType, TList, TTuple, TConst, TSchema, InferSchema } from '../../index.js';

type Fn = (o: any) => string;
type Refs = Record<string, Fn>;

// eslint-disable-next-line
const stringifyPrimitive = (val: any): string => '' + val;

export const loadSchema = (schema: TType, refs: Refs): Fn => {
  if (typeof schema === 'string')
    return schema === 'any' || schema === 'string' ? JSON.stringify : stringifyPrimitive;

  const fn = loadSchemaWithoutNullable(schema, refs);
  return schema.nullable === true
    // eslint-disable-next-line
    ? (o) => o === null ? 'null' : fn(o)
    : fn;
};

export function loadSchemaWithoutNullable(schema: Exclude<TType, string>, refs: Refs): Fn {
  for (const key in schema) {
    if (key === 'type')
      // String
      return JSON.stringify;
    else if (key === 'items') {
      const stringifyItem = loadSchema((schema as TList).items, refs);
      // eslint-disable-next-line
      return (o: any[]) => '[' + o.map(stringifyItem).join() + ']';
    } else if (key === 'props' || key === 'optionalProps') {
      // TODO
      return JSON.stringify;
    } else if (key === 'tag' || key === 'maps') {
      // TODO
      return JSON.stringify;
    } else if (key === 'const') {
      const c = JSON.stringify((schema as TConst).const);
      return () => c;
    } else if (key === 'ref') {
      // Lazy loading
      let fn: Fn | undefined;
      return (o) => (fn ??= refs[key])(o);
    } else if (key === 'values') {
      const values = (schema as TTuple).values.map((val) => loadSchema(val, refs));
      const stringifyItem = (o: any, i: number): string => values[i](o);
      // eslint-disable-next-line
      return (o) => '[' + o.map(stringifyItem).join() + ']';
    } else if (key === 'allOf' || key === 'anyOf')
      return JSON.stringify;
  }

  throw new Error('Invalid schema');
}

export default <T extends TSchema>(schema: T): (o: InferSchema<T>) => string => {
  if (typeof schema.defs === 'undefined')
    return loadSchema(schema, null as unknown as Refs) as any;

  const refs: Refs = {};

  const defs = schema.defs;
  for (const key in defs) refs[key] = null as any as Fn;
  for (const key in defs) refs[key] = loadSchema(defs[key], refs);

  return loadSchema(schema, refs) as any;
};
