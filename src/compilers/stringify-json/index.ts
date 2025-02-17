import type { TType, TList, TObject, TTuple, TRef, TConst, TSchema, TTaggedUnion, InferSchema, TBasic, TExtendedBasic } from '../../index.js';
import buildSchema from '../build.js';

export const isSerializableType = (type: TBasic): boolean => (/^[iufb].*/).test(type);

// eslint-disable-next-line
export const loadType = (type: TBasic, id: string, isAlreadyString: boolean): string => isSerializableType(type)
  ? isAlreadyString ? id : `''+${id}`
  : `JSON.stringify(${id})`;

type State = [refs: Record<string, number>, decls: string[]];

export const loadSchema = (schema: TType, id: string, isAlreadyString: boolean, state: State): string => {
  if (typeof schema === 'string')
    return loadType(schema, id, isAlreadyString);

  let str = schema.nullable === true ? `${id}===null?'null':` : '';

  for (const key in schema) {
    if (key === 'type')
      return loadType((schema as TExtendedBasic).type, id, isAlreadyString);
    else if (key === 'item') {
      let item = (schema as TList).item;

      if (typeof item !== 'string') {
        if ('type' in item)
          item = item.type;
        else {
          // Handle complex types
          return `${str}(${id}.length===0?"[]":"["+${id}.map((o)=>${loadSchema((schema as TList).item, 'o', true, state)}).join()+"]")`;
        }
      }

      // Handle string types
      return str + (isSerializableType(item)
        ? `"["+${id}.join()+"]"`
        : `(${id}.length===0?"[]":"["+${id}.map(JSON.stringify).join()+"]")`
      );
    } else if (key === 'props' || key === 'optionalProps') {
      str += '"{"+';

      // Optimal string concat
      let hasKeys = false;

      // Required props
      let props = (schema as TObject).props;
      if (typeof props !== 'undefined') {
        for (const itemKey in props) {
          str += `${hasKeys ? "+'," : "'"}"${itemKey}":'+(${loadSchema(props[itemKey], `${id}.${itemKey}`, true, state)})`;
          hasKeys = true;
        }
      }

      const hasRequiredKeys = hasKeys;

      // Optional props
      props = (schema as TObject).optionalProps;
      if (typeof props !== 'undefined') {
        for (const itemKey in props) {
          str += `${hasKeys ? '+' : ''}(typeof ${id}.${itemKey}==="undefined"?"":',"${itemKey}":'+(${loadSchema(props[itemKey], `${id}.${itemKey}`, true, state)}))`;
          hasKeys = true;
        }
      }

      // Remove the leading ','
      return `${str}${hasRequiredKeys ? '' : '.slice(1)'}+"}"`;
    } else if (key === 'tag' || key === 'map') {
      str += '"{"+(';

      const tag = (schema as TTaggedUnion).tag;
      // "name":
      const encodedTag = `"\\"${JSON.stringify(tag).slice(1, -1)}\\":`;

      // The tag property
      const tagId = `${id}.${(schema as TTaggedUnion).tag}`;
      const maps = (schema as TTaggedUnion).map;

      let tmpSchema: TObject;
      let props: Record<string, TType> | undefined;
      let stringifiedVal: string;

      for (const val in maps) {
        stringifiedVal = JSON.stringify(val);
        str += `${tagId}===${stringifiedVal}?(${encodedTag}\\"${stringifiedVal.slice(1, -1)}\\""`;
        tmpSchema = maps[val];

        props = tmpSchema.props;
        if (props != null)
          for (const itemKey in props) str += `+',"${itemKey}":'+(${loadSchema(props[itemKey], `${id}.${itemKey}`, true, state)})`;

        props = (schema as TObject).optionalProps;
        if (props != null)
          for (const itemKey in props) str += `+(typeof ${id}.${itemKey}==="undefined"?"":',"${itemKey}":'+(${loadSchema(props[itemKey], `${id}.${itemKey}`, true, state)}))`;

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
      return `${str}d${state[0][(schema as TRef).ref]}(${id})`;
    } else if (key === 'values') {
      // Handle tuples
      const schemas = (schema as TTuple).values;

      str += '"["+(';
      str += loadSchema(schemas[0], `${id}[${0}]`, true, state);

      for (let i = 1, l = schemas.length; i < l; i++) {
        str += ')+(';
        str += loadSchema(schemas[i], `${id}[${i}]`, true, state);
      }

      // eslint-disable-next-line
      return str + ')+"]"';
    }
  }

  // eslint-disable-next-line
  return str + 'null';
};

const f = (schema: TSchema, id: string, decls: string[]): string => {
  if (schema.defs == null)
    return loadSchema(schema, id, false, [null as unknown as Record<string, number>, decls]);

  const refs: Record<string, number> = {};
  const state: State = [refs, decls];

  const defs = schema.defs;
  const schemas: [TType, number][] = [];

  // Initialize references first
  for (const key in defs) schemas.push([defs[key], refs[key] = decls.push('')]);

  // Then build the schemas
  // eslint-disable-next-line
  for (let i = 0, l = schemas.length; i < l; i++) decls[schemas[i][1]] = '(o)=>' + loadSchema(schemas[i][0], 'o', false, state);

  return loadSchema(schema, id, false, state);
};

export default f;
export const build = <const T extends TSchema>(schema: T): (o: InferSchema<T>) => string => buildSchema(schema, f) as any;
