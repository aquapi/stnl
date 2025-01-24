import type { TType, TList, TObject, TTuple, TRef, TConst, TSchema, TTaggedUnion, InferSchema, TBasicMap } from '../index.js';
import buildSchema from './build.js';

// eslint-disable-next-line
export const loadType = (type: keyof TBasicMap, id: string, isAlreadyString: boolean): string => /^[iuf].*/.test(type)
  ? isAlreadyString ? id : `''+${id}`
  : `JSON.stringify(${id})`;

export const loadSchema = (schema: TType, id: string, refs: Record<string, number>, isAlreadyString: boolean): string => {
  if (typeof schema === 'string')
    return loadType(schema, id, isAlreadyString);

  let str = schema.nullable === true ? `${id}===null?'null':` : '';

  for (const key in schema) {
    if (key === 'items') {
      // Handle arrays
      return `${str}("[" + ${id}.map((o)=>${loadSchema((schema as TList).items, 'o', refs, true)}).join() + "]")`;
    } else if (key === 'props' || key === 'optionalProps') {
      str += '"{"+(';

      // Optimal string concat
      let hasKeys = false;

      // Required props
      let props = (schema as TObject).props;
      if (typeof props !== 'undefined') {
        for (const itemKey in props) {
          str += `${hasKeys ? "+'," : "'"}"${itemKey}":'+(${loadSchema(props[itemKey], `${id}.${itemKey}`, refs, true)})`;
          hasKeys = true;
        }
      }

      const hasRequiredKeys = hasKeys;

      // Optional props
      props = (schema as TObject).optionalProps;
      if (typeof props !== 'undefined') {
        for (const itemKey in props) {
          str += `${hasKeys ? '+' : ''}(typeof ${id}.${itemKey}==="undefined"?"":',"${itemKey}":'+(${loadSchema(props[itemKey], `${id}.${itemKey}`, refs, true)}))`;
          hasKeys = true;
        }
      }

      // Remove the leading ','
      return `${str})${hasRequiredKeys ? '' : '.slice(1)'}+"}"`;
    } else if (key === 'tag' || key === 'maps') {
      str += '"{"+(';

      const tag = (schema as TTaggedUnion).tag;
      // "name":
      const encodedTag = `"\\"${JSON.stringify(tag).slice(1, -1)}\\":`;

      // The tag property
      const tagId = `${id}.${(schema as TTaggedUnion).tag}`;
      const maps = (schema as TTaggedUnion).maps;

      let tmpSchema: TObject;
      let props: Record<string, TType> | undefined;
      let stringifiedVal: string;

      for (const val in maps) {
        stringifiedVal = JSON.stringify(val);
        str += `${tagId}===${stringifiedVal}?(${encodedTag}\\"${stringifiedVal.slice(1, -1)}\\""`;
        tmpSchema = maps[val];

        props = tmpSchema.props;
        if (props != null)
          for (const itemKey in props) str += `+',"${itemKey}":'+(${loadSchema(props[itemKey], `${id}.${itemKey}`, refs, true)})`;

        props = (schema as TObject).optionalProps;
        if (props != null)
          for (const itemKey in props) str += `+(typeof ${id}.${itemKey}==="undefined"?"":',"${itemKey}":'+(${loadSchema(props[itemKey], `${id}.${itemKey}`, refs, true)}))`;

        str += '):';
      }

      return `${str}"")+"}"`;
    } else if (key === 'const') {
      // Inline constants
      return str + (typeof (schema as TConst).const === 'string'
        ? JSON.stringify((schema as TConst).const)
        : `"${(schema as TConst).const}"`);
    } else if (key === 'ref') {
      // Search references
      return `${str}d${refs[(schema as TRef).ref]}(${id})`;
    } else if (key === 'values') {
      // Handle tuples
      const schemas = (schema as TTuple).values;

      str += '"["+(';
      str += loadSchema(schemas[0], `${id}[${0}]`, refs, true);

      for (let i = 1, l = schemas.length; i < l; i++) {
        str += ')+(';
        str += loadSchema(schemas[i], `${id}[${i}]`, refs, true);
      }

      // eslint-disable-next-line
      return str + ')+"]"';
    } else if (key === 'allOf' || key === 'anyOf' || key === 'type') {
      // Union, intersection and string
      return `${str}JSON.stringify(${id})`;
    }
  }

  // eslint-disable-next-line
  return str + 'null';
};

const f = (schema: TSchema, id: string, decls: string[]): string => {
  if (typeof schema.defs === 'undefined')
    return loadSchema(schema, id, null as unknown as Record<string, number>, false);

  const refs: Record<string, number> = {};

  const defs = schema.defs;
  const schemas: [TType, number][] = [];

  // Initialize references first
  for (const key in defs) schemas.push([defs[key], refs[key] = decls.push('')]);

  // Then build the schemas
  // eslint-disable-next-line
  for (let i = 0, l = schemas.length; i < l; i++) decls[schemas[i][1]] = '(o)=>' + loadSchema(schemas[i][0], 'o', refs, false);

  return loadSchema(schema, id, refs, false);
};

export default f;
export const build = <const T extends TSchema>(schema: T): (o: InferSchema<T>) => string => buildSchema(schema, f) as any;
