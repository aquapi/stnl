import type { TType, TBasic, TString, TList, TObject, TTuple, TIntersection, TUnion, TRef, TConst, TSchema, TTaggedUnion, InferSchema, TNumber } from '../../index.js';
import buildSchema from '../build.js';

export const loadObjectProps = (schema: TObject, id: string, refs: Record<string, number>): string => {
  let str = '';

  // Required props
  let props = schema.props;
  if (typeof props !== 'undefined')
    for (const itemKey in props) str += `&&(typeof ${id}.${itemKey}!=='undefined'||${loadSchema(props[itemKey], `${id}.${itemKey}`, refs)})`;

  // Optional props
  props = schema.optionalProps;
  if (typeof props !== 'undefined')
    for (const itemKey in props) str += `&&(typeof ${id}.${itemKey}==='undefined'||${loadSchema(props[itemKey], `${id}.${itemKey}`, refs)})`;

  return str;
};

// eslint-disable-next-line
export const loadType = (type: TBasic['type'], id: string): string => type === 'int'
  ? `Number.isSafeInteger(${id})`
  : type === 'any'
    ? 'true'
    : `typeof ${id}==='${type === 'float'
      ? 'number'
      : type === 'bool'
        ? 'boolean'
        : 'string'
    }'`;

export function loadSchema(schema: TType, id: string, refs: Record<string, number>): string {
  if (typeof schema === 'string')
    return loadType(schema, id);

  let str = schema.nullable === true ? `(${id}===null||` : '';

  loop: for (const key in schema) {
    if (key === 'type') {
      str += loadType((schema as TBasic).type, id);

      // Handle primitives
      switch ((schema as TBasic).type) {
        case 'bool':
        case 'any':
          break loop;

        case 'int':
        case 'float':
          if (typeof (schema as TNumber).max === 'number')
            str += `&&${id}<=${(schema as TNumber).max!}`;
          if (typeof (schema as TNumber).min === 'number')
            str += `&&${id}>=${(schema as TNumber).min!}`;

          break loop;

        case 'string':
          if (typeof (schema as TString).maxLen === 'number')
            str += `&&${id}.length<${(schema as TString).maxLen! + 1}`;
          if (typeof (schema as TString).minLen === 'number')
            str += `&&${id}.length>${(schema as TString).minLen! - 1}`;

          break loop;
      }
    } else if (key === 'items') {
      str += `Array.isArray(${id})`;

      if (typeof (schema as TList).maxLen === 'number')
        str += `&&${id}.length<${(schema as TList).maxLen! + 1}`;
      if (typeof (schema as TList).minLen === 'number')
        str += `&&${id}.length>${(schema as TList).minLen! - 1}`;

      str += `&&${id}.every((o)=>${loadSchema((schema as TList).items, 'o', refs)})`;
      break;
    } else if (key === 'props' || key === 'optionalProps') {
      str += `typeof ${id}==='object'`;
      if (schema.nullable !== true)
        str += `&&${id}!==null`;

      str += loadObjectProps(schema as TObject, id, refs);
      break;
    } else if (key === 'tag' || key === 'maps') {
      str += `typeof ${id}==='object'&&`;
      if (schema.nullable !== true)
        str += `${id}!==null&&`;

      const tagId = `${id}.${(schema as TTaggedUnion).tag}`;
      str += `typeof ${tagId}==='string'&&`;

      const maps = (schema as TTaggedUnion).maps;
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
