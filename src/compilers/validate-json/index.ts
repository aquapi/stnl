import type { TType, TString, TList, TObject, TTuple, TIntersection, TUnion, TRef, TConst, TSchema, TTaggedUnion, InferSchema, TBasic, TExtendedBasic, TFloat, TInt } from '../../index.js';
import buildSchema from '../build.js';

export const loadObjectProps = (schema: TObject, id: string, refs: Record<string, number>): string => {
  let str = '';

  // Required props
  let props = schema.props;
  if (props != null)
    for (const itemKey in props) str += `&&${loadSchema(props[itemKey], `${id}.${itemKey}`, refs)}`;

  // Optional props
  props = schema.optionalProps;
  if (props != null)
    for (const itemKey in props) str += `&&(typeof ${id}.${itemKey}==='undefined'||${loadSchema(props[itemKey], `${id}.${itemKey}`, refs)})`;

  return str;
};

export const loadLenChecks = (schema: TString | TList, id: string): string =>
  // eslint-disable-next-line
  (typeof schema.maxLen === 'number' ? `&&${id}.length<${(schema as TString).maxLen! + 1}` : '') + (typeof schema.minLen === 'number' ? `&&${id}.length>${(schema as TString).minLen! - 1}` : '');

export const loadIntLimitChecks = (schema: TInt, typeMin: number, typeMax: number, id: string): string => `&&${id}>${(schema.min ?? typeMin) - 1}&&${id}<${(schema.max ?? typeMax) + 1}`;

export const loadType = (type: TBasic, id: string): string => {
  switch (type.charCodeAt(0)) {
    // Any
    case 97:
      return `typeof ${id}!=='undefined'`;

    // Bool
    case 98:
      return `typeof ${id}==='boolean'`;

    // Float
    case 102:
      return `typeof ${id}==='number'`;

    // Signed integers
    case 105: {
      const limit = 2 ** (+type.slice(1) - 1);
      return `Number.isInteger(${id})&&${id}>${-limit - 1}&&${id}<${limit}`;
    }

    // String
    case 115:
      return `typeof ${id}==='string'`;

    // Unsigned integers
    case 117: {
      const limit = 2 ** +type.slice(1);
      return `Number.isInteger(${id})&&${id}>-1&&${id}<${limit}`;
    }
  }

  return '';
};

export function loadSchema(schema: TType, id: string, refs: Record<string, number>): string {
  if (typeof schema === 'string')
    return loadType(schema, id);

  let str = schema.nullable === true ? `(${id}===null||` : '';

  loop: for (const key in schema) {
    if (key === 'type') {
      switch ((schema as TExtendedBasic).type.charCodeAt(0)) {
        // Float
        case 102:
          str += `typeof ${id}==='number'`;

          // No optimization
          if ((schema as TFloat).max != null)
            str += `&&${id}<=${(schema as TFloat).max!}`;
          if ((schema as TFloat).min != null)
            str += `&&${id}>=${(schema as TFloat).min!}`;
          if ((schema as TFloat).exclusiveMax != null)
            str += `&&${id}<${(schema as TFloat).exclusiveMax!}`;
          if ((schema as TFloat).exclusiveMin != null)
            str += `&&${id}>${(schema as TFloat).exclusiveMin!}`;

          break loop;

        // Signed integers
        case 105: {
          const limit = 2 ** (+(schema as TExtendedBasic).type.slice(1) - 1);
          str += `Number.isInteger(${id})${loadIntLimitChecks(schema as TInt, -limit, limit - 1, id)}`;
          break loop;
        }

        // String
        case 115:
          str += `typeof ${id}==='string'${loadLenChecks(schema as TString, id)}`;
          break loop;

        // Unsigned integers
        case 117: {
          str += `Number.isInteger(${id})${loadIntLimitChecks(
            schema as TInt,
            // eslint-disable-next-line
            0, (2 ** +(schema as TExtendedBasic).type.slice(1)) - 1,
            id
          )}`;
          break loop;
        }
      }
    } else if (key === 'item') {
      str += `Array.isArray(${id})${loadLenChecks(schema as TList, id)}&&${id}.every((o)=>${loadSchema((schema as TList).item, 'o', refs)})`;
      break;
    } else if (key === 'props' || key === 'optionalProps') {
      str += `typeof ${id}==='object'`;
      if (schema.nullable !== true)
        str += `&&${id}!==null`;

      str += loadObjectProps(schema as TObject, id, refs);
      break;
    } else if (key === 'tag' || key === 'map') {
      str += `typeof ${id}==='object'&&`;
      if (schema.nullable !== true)
        str += `${id}!==null&&`;

      const tagId = `${id}.${(schema as TTaggedUnion).tag}`;
      str += `typeof ${tagId}==='string'&&`;

      const maps = (schema as TTaggedUnion).map;
      for (const val in maps) str += `${tagId}===${JSON.stringify(val)}?true${loadObjectProps(maps[val], id, refs)}:`;

      str += 'false';
      break;
    } else if (key === 'const') {
      // Inline constants
      str += `${id}===${JSON.stringify((schema as TConst).const)}`;
      break;
    } else if (key === 'ref') {
      // Search references
      str += `d${refs[(schema as TRef).ref]}(${id})`;
      break;
    } else if (key === 'values') {
      // Handle tuples
      str += `Array.isArray(${id})&&${id}.length===${(schema as TTuple).values.length}`;

      // Handle tuples
      for (let i = 0,
        schemas = (schema as TTuple).values,
        l = schemas.length;
        i < l; i++
      ) str += `&&(${loadSchema(schemas[i], `${id}[${i}]`, refs)})`;

      break;
    } else if (key === 'allOf') {
      // Handle intersection
      const schemas = (schema as TIntersection).allOf;
      str += loadSchema(schemas[0], id, refs);

      for (let i = 1, l = schemas.length; i < l; i++) str += `&&(${loadSchema(schemas[i], id, refs)})`;

      break;
    } else if (key === 'anyOf') {
      // Handle unions
      const schemas = (schema as TUnion).anyOf;

      str += '(';
      loadSchema(schemas[0], id, refs);

      for (let i = 1, l = schemas.length; i < l; i++) {
        str += ')||(';
        str += loadSchema(schemas[i], id, refs);
      }

      str += ')';
      break;
    }
  }

  // eslint-disable-next-line
  return schema.nullable === true ? str + ')' : str;
}

const f = (schema: TSchema, id: string, decls: string[]): string => {
  if (typeof schema.defs === 'undefined')
    return loadSchema(schema, id, null as unknown as Record<string, number>);

  const refs: Record<string, number> = {};

  const defs = schema.defs;
  const schemas: [TType, number][] = [];

  // Initialize references first
  for (const key in defs) schemas.push([defs[key], refs[key] = decls.push('')]);

  // Then build the schemas
  // eslint-disable-next-line
  for (let i = 0, l = schemas.length; i < l; i++) decls[schemas[i][1]] = '(o)=>' + loadSchema(schemas[i][0], 'o', refs);

  return loadSchema(schema, id, refs);
};

export default f;
export const build = <const T extends TSchema>(schema: T): (o: any) => o is InferSchema<T> => buildSchema(schema, f) as any;
