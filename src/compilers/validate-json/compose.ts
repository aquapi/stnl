import type { TType, TBasic, TString, TList, TObject, TTuple, TIntersection, TUnion, TConst, TSchema, InferSchema, TTaggedUnion, TNumber } from '../../index.js';

type Fn = (o: any) => boolean;
type Refs = Record<string, Fn>;

const isBool: Fn = (o) => typeof o === 'boolean';
const isFloat: Fn = (o) => typeof o === 'number';
const isAny: Fn = (o) => typeof o !== 'undefined';
const isString: Fn = (o) => typeof o === 'string';

export const loadSchema = (schema: TType, refs: Refs): Fn => {
  if (typeof schema === 'string') {
    return schema === 'any'
      ? isAny
      : schema === 'bool'
        ? isBool
        : schema === 'int'
          ? Number.isSafeInteger
          : schema === 'float'
            ? isFloat
            : isString;
  }

  const fn = loadSchemaWithoutNullable(schema, refs);
  return schema.nullable === true ? (o) => o === null || fn(o) : fn;
};

const loadNumberSchema = (isFloatSchema: boolean, schema: TNumber): Fn => {
  const max = schema.max ?? Infinity;
  const min = schema.min ?? -Infinity;

  return isFloatSchema
    ? (o) => typeof o === 'number' && o <= max && o >= min
    : (o) => Number.isSafeInteger(o) && o <= max && o >= min;
};

export function loadSchemaWithoutNullable(schema: Exclude<TType, string>, refs: Refs): Fn {
  for (const key in schema) {
    if (key === 'type') {
      // Handle primitives
      switch ((schema as TBasic | TString).type) {
        case 'bool':
          return isBool;

        case 'string': {
          const max = ((schema as TString).maxLen ?? Infinity) + 1;
          const min = ((schema as TString).minLen ?? 0) - 1;
          return (o) => typeof o === 'string' && o.length < max && o.length > min;
        }

        case 'int':
          return loadNumberSchema(false, schema as TNumber);

        case 'float':
          return loadNumberSchema(false, schema as TNumber);

        case 'any':
          return isAny;
      }
    } else if (key === 'items') {
      const items = loadSchema((schema as TList).items, refs);
      const max = ((schema as TList).maxLen ?? Infinity) + 1;
      const min = ((schema as TList).minLen ?? 0) - 1;

      return (o) => Array.isArray(o) && o.length > min && o.length < max && o.every(items);
    } else if (key === 'props' || key === 'optionalProps') {
      // Required props
      const [propsKey, propsVal] = (schema as TObject).props == null
        ? [[] as string[], [] as Fn[]] as const
        : [
          Object.keys((schema as TObject).props!),
          Object.values((schema as TObject).props!).map((v) => loadSchema(v, refs))
        ] as const;

      const [optionalPropsKey, optionalPropsVal] = (schema as TObject).optionalProps == null
        ? [[] as string[], [] as Fn[]] as const
        : [
          Object.keys((schema as TObject).optionalProps!),
          Object.values((schema as TObject).optionalProps!).map((v) => loadSchema(v, refs))
        ] as const;

      return (o) => {
        if (typeof o !== 'object' || o === null) return false;

        let tmp: any;

        for (let i = 0; i < propsKey.length; i++) {
          // eslint-disable-next-line
          tmp = o[propsKey[i]];
          if (typeof tmp === 'undefined' || !propsVal[i](tmp))
            return false;
        }

        for (let i = 0; i < optionalPropsKey.length; i++) {
          // eslint-disable-next-line
          tmp = o[optionalPropsKey[i]];
          if (typeof tmp !== 'undefined' && !optionalPropsVal[i](tmp))
            return false;
        }

        return true;
      };
    } else if (key === 'tag' || key === 'maps') {
      const tag = (schema as TTaggedUnion).tag;
      const maps = new Map(Object.entries((schema as TTaggedUnion).maps).map((tagVal) => [
        tagVal[0], [
          tagVal[1].props == null
            ? []
            : Object.entries(tagVal[1].props).map((kv) => [kv[0], loadSchema(kv[1], refs)] as const),

          tagVal[1].optionalProps == null
            ? []
            : Object.entries(tagVal[1].optionalProps).map((kv) => [kv[0], loadSchema(kv[1], refs)] as const)
        ] as const
      ] as const));

      return (o) => {
        // eslint-disable-next-line
        if (typeof o !== 'object' || o === null || typeof o[tag] !== 'string') return false;

        // eslint-disable-next-line
        const lists = maps.get(o[tag]);
        if (typeof lists === 'undefined') return false;

        let tmp: any;

        for (let i = 0, propsList = lists[0]; i < propsList.length; i++) {
          // eslint-disable-next-line
          tmp = o[propsList[i][0]];
          if (typeof tmp === 'undefined' || !propsList[i][1](tmp))
            return false;
        }

        for (let i = 0, propsList = lists[1]; i < propsList.length; i++) {
          // eslint-disable-next-line
          tmp = o[propsList[i][0]];
          if (typeof tmp !== 'undefined' && !propsList[i][1](tmp))
            return false;
        }

        return true;
      };
    } else if (key === 'const') {
      const c = (schema as TConst).const;
      return (o) => o === c;
    } else if (key === 'ref') {
      // Lazy loading
      let fn: Fn | undefined;
      return (o) => (fn ??= refs[key])(o);
    } else if (key === 'values') {
      const len = (schema as TTuple).values.length;
      const values = (schema as TTuple).values.map((val) => loadSchema(val, refs));

      return (o) => {
        if (!Array.isArray(o) || o.length !== len) return false;

        for (let i = 0; i < len; i++) {
          if (!values[i](o[i]))
            return false;
        }

        return true;
      };
    } else if (key === 'allOf') {
      // Handle intersection
      const schemas = (schema as TIntersection).allOf.map((val) => loadSchema(val, refs));

      return (o) => {
        for (let i = 0; i < schemas.length; i++) {
          if (!schemas[i](o))
            return false;
        }

        return true;
      };
    } else if (key === 'anyOf') {
      // Handle unions
      const schemas = (schema as TUnion).anyOf.map((val) => loadSchema(val, refs));

      return (o) => {
        for (let i = 0; i < schemas.length; i++) {
          if (schemas[i](o))
            return true;
        }

        return false;
      };
    }
  }

  throw new Error('Invalid schema');
}

export default <T extends TSchema>(schema: T): (o: any) => o is InferSchema<T> => {
  if (typeof schema.defs === 'undefined')
    return loadSchema(schema, null as unknown as Record<string, Fn>) as any;

  const refs: Record<string, Fn> = {};

  const defs = schema.defs;
  for (const key in defs) refs[key] = null as any as Fn;
  for (const key in defs) refs[key] = loadSchema(defs[key], refs);

  return loadSchema(schema, refs) as any;
};
