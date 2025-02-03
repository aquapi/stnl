import type { TType, TList, TTuple, TConst, TSchema, InferSchema, TBasic, TExtendedBasic, TRef } from '../../index.js';

type Fn = (o: any) => string;
type Refs = Record<string, Fn>;

// eslint-disable-next-line
const stringifyPrimitive = (val: any): string => '' + val;
// eslint-disable-next-line
const stringifyPrimitiveArray = (val: any[]) => '[' + val.join() + ']';
// eslint-disable-next-line
const primitiveStringifier = (schema: TBasic) => schema === 'any' || schema === 'string' ? JSON.stringify : stringifyPrimitive;
// eslint-disable-next-line
const arrayStringifier = (each: (item: any, i: number) => any): Fn => (o: any[]) => '[' + o.map(each).join() + ']';

export const loadSchema = (schema: TType, refs: Refs): Fn => {
  if (typeof schema === 'string')
    return primitiveStringifier(schema);

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
      return primitiveStringifier((schema as TExtendedBasic).type);
    else if (key === 'item') {
      const stringifyItem = loadSchema((schema as TList).item, refs);

      return stringifyItem === stringifyPrimitive
        ? stringifyPrimitiveArray
        : arrayStringifier(stringifyItem);
    } else if (key === 'props' || key === 'optionalProps') {
      // TODO
      return JSON.stringify;
    } else if (key === 'tag' || key === 'map') {
      // TODO
      return JSON.stringify;
    } else if (key === 'const') {
      const c = JSON.stringify((schema as TConst).const);
      return () => c;
    } else if (key === 'ref') {
      // Lazy loading
      let fn: Fn | undefined;
      return (o) => (fn ??= refs[(schema as TRef).ref])(o);
    } else if (key === 'values') {
      const values = (schema as TTuple).values.map((val) => loadSchema(val, refs));
      return arrayStringifier((o: any, i: number): string => values[i](o));
    } else if (key === 'allOf')
      return JSON.stringify;
  }

  throw new Error('Invalid schema');
}

export default <T extends TSchema>(schema: T): (o: InferSchema<T>) => string => {
  if (schema.defs == null)
    return loadSchema(schema, null as unknown as Refs) as any;

  const refs: Refs = {};

  const defs = schema.defs;
  for (const key in defs) refs[key] = null as any as Fn;
  for (const key in defs) refs[key] = loadSchema(defs[key], refs);

  return loadSchema(schema, refs) as any;
};
