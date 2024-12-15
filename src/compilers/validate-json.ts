import type { TType, TBasic, TString, TList, TObject, TTuple, TIntersection, TUnion, TRef, TConst, TSchema } from '../index.js';
import { compiler } from '../policy.js';

export const loadSchema = (schema: TType, id: string, refs: Record<string, string>): string => {
  let str = schema.nullable === true ? `(${id}===null||` : '';

  loop: for (const key in schema) {
    if (key === 'type') {
      // Handle primitives
      switch ((schema as TBasic | TString).type) {
        case 'bool':
          str += `typeof ${id}==='boolean'`;
          break loop;

        case 'string':
          str += `typeof ${id}==='string'`;

          if (typeof (schema as TString).maxLength === 'number')
            str += `&&${id}.length<${(schema as TString).maxLength! + 1}`;
          if (typeof (schema as TString).minLength === 'number')
            str += `&&${id}.length>${(schema as TString).minLength! - 1}`;

          break loop;

        case 'int':
          str += `Number.isInteger(${id})`;
          break loop;

        case 'float':
          str += compiler.nonFiniteFloat ? `typeof ${id}==='number'` : `Number.isFinite(${id})`;
          break loop;

        case 'any':
          str += `typeof ${id}!=='undefined'`;
          break loop;
      }
    } else if (key === 'items') {
      str += `Array.isArray(${id})`;

      if (typeof (schema as TList).maxLength === 'number')
        str += `&&${id}.length<${(schema as TList).maxLength! + 1}`;
      if (typeof (schema as TList).minLength === 'number')
        str += `&&${id}.length>${(schema as TList).minLength! - 1}`;

      str += `&&${id}.every((o)=>${loadSchema((schema as TList).items, 'o', refs)})`;
      break;
    } else if (key === 'props' || key === 'optionalProps') {
      str += `typeof ${id}==='object'`;
      if (schema.nullable !== true)
        str += `&&${id}!==null`;

      // Required props
      let props = (schema as TObject).props;
      if (typeof props !== 'undefined')
        for (const itemKey in props) str += `&&(${loadSchema(props[itemKey], `${id}.${itemKey}`, refs)})`;

      // Optional props
      props = (schema as TObject).optionalProps;
      if (typeof props !== 'undefined')
        for (const itemKey in props) str += `&&(typeof ${id}.${itemKey}==='undefined'||${loadSchema(props[itemKey], `${id}.${itemKey}`, refs)})`;

      break;
    } else if (key === 'const') {
      // Inline constants
      str += `${id}===${JSON.stringify((schema as TConst).const)}`;
      break;
    } else if (key === 'ref') {
      // Search references
      str += `${refs[(schema as TRef).ref]}(${id})`;
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
};

export default (schema: TSchema, id: string, decls: string[][]): string => {
  if (typeof schema.defs === 'undefined')
    return loadSchema(schema, id, null as unknown as Record<string, string>);

  const refs: Record<string, string> = {};

  if (typeof schema.defs !== 'undefined') {
    const defs = schema.defs;
    const schemas: [TType, string[]][] = [];

    // Initialize references first
    let tmp: string[];
    for (const key in defs) {
      // Load the references to declarations first
      tmp = ['(o)=>'];
      refs[key] = `d${decls.push(tmp)}`;

      // Store the string builder reference
      schemas.push([defs[key], tmp]);
    }

    // Then build the schemas
    for (let i = 0, l = schemas.length; i < l; i++) schemas[i][1][0] += loadSchema(schemas[i][0], 'o', refs);
  }

  return loadSchema(schema, id, refs);
};
