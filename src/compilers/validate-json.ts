import type { TType, TBasic, TString, TList, TObject, TTuple, TIntersection, TUnion, TRef, TConst, TSchema } from '../index.js';
import { compiler } from '../policy.js';

export const loadSchema = (schema: TType, id: string, content: string[], refs: Record<string, string>): void => {
  if (schema.nullable === true)
    content.push(`(${id}===null||`);

  loop: for (const key in schema) {
    if (key === 'type') {
      // Handle primitives
      switch ((schema as TBasic | TString).type) {
        case 'bool':
          content.push(`typeof ${id}==='boolean'`);
          break loop;

        case 'string':
          content.push(`typeof ${id}==='string'${typeof (schema as TString).maxLength === 'number'
            ? `&&${id}.length<${(schema as TString).maxLength! + 1}`
            : ''
          }${typeof (schema as TString).minLength === 'number'
            ? `&&${id}.length>${(schema as TString).minLength! - 1}`
            : ''
          }`);
          break loop;

        case 'int':
          content.push(`Number.isInteger(${id})`);
          break loop;

        case 'float':
          content.push(compiler.nonFiniteFloat ? `typeof ${id}==='number'` : `Number.isFinite(${id})`);
          break loop;

        case 'any':
          content.push(`typeof ${id}!=='undefined'`);
          break loop;
      }
    } else if (key === 'items') {
      // Handle arrays
      content.push(`Array.isArray(${id})${typeof (schema as TList).maxLength === 'number'
        ? `&&${id}.length<${(schema as TList).maxLength! + 1}`
        : ''
      }${typeof (schema as TList).minLength === 'number'
        ? `&&${id}.length>${(schema as TList).minLength! - 1}`
        : ''
      }&&${id}.every((o)=>`);
      loadSchema((schema as TList).items, 'o', content, refs);
      content.push(')');

      break;
    } else if (key === 'props' || key === 'optionalProps') {
      // Handle objects
      content.push(`typeof ${id}==='object'${schema.nullable === true ? '' : `&&${id}!==null`}`);

      // Required props
      let props = (schema as TObject).props;
      if (typeof props !== 'undefined') {
        for (const itemKey in props) {
          content.push('&&');
          loadSchema(props[itemKey], `${id}.${itemKey}`, content, refs);
        }
      }

      // Optional props
      props = (schema as TObject).optionalProps;
      if (typeof props !== 'undefined') {
        for (const itemKey in props) {
          content.push(`&&(typeof ${id}.${itemKey}==='undefined'||`);
          loadSchema(props[itemKey], `${id}.${itemKey}`, content, refs);
          content.push(')');
        }
      }

      break;
    } else if (key === 'const') {
      // Inline constants
      content.push(`${id}===${JSON.stringify((schema as TConst).const)}`);
      break;
    } else if (key === 'ref') {
      // Search references
      content.push(`${refs[(schema as TRef).ref]}(${id})`);
      break;
    } else if (key === 'values') {
      // Handle tuples
      content.push(`Array.isArray(${id})&&${id}.length===${(schema as TTuple).values.length}`);

      // Handle tuples
      for (let i = 0, schemas = (schema as TTuple).values, l = schemas.length; i < l; i++) {
        content.push('&&');
        loadSchema(schemas[i], `${id}[${i}]`, content, refs);
      }

      break;
    } else if (key === 'allOf') {
      // Handle intersection
      const schemas = (schema as TIntersection).allOf;
      loadSchema(schemas[0], id, content, refs);

      for (let i = 1, l = schemas.length; i < l; i++) {
        content.push('&&');
        loadSchema(schemas[i], id, content, refs);
      }

      break;
    } else if (key === 'anyOf') {
      // Handle unions
      const schemas = (schema as TUnion).anyOf;

      content.push('(');
      loadSchema(schemas[0], id, content, refs);

      for (let i = 1, l = schemas.length; i < l; i++) {
        content.push(')||(');
        loadSchema(schemas[i], id, content, refs);
      }

      content.push(')');
      break;
    }
  }

  if (schema.nullable === true)
    content.push(')');
};

export default (schema: TSchema, id: string, content: string[], decls: string[][]): void => {
  if (typeof schema.defs === 'undefined')
    loadSchema(schema, id, content, null as unknown as Record<string, string>);
  else {
    const refs: Record<string, string> = {};

    if (typeof schema.defs !== 'undefined') {
      const defs = schema.defs;
      const schemas: [TType, string[]][] = [];

      // Initialize references first
      let tmp: string[];
      for (const key in defs) {
        tmp = ['(o)=>'];
        refs[key] = `d${decls.push(tmp)}`;

        // Store the string builder reference
        schemas.push([defs[key], tmp]);
      }

      // Then build the schemas
      for (let i = 0, l = schemas.length; i < l; i++) loadSchema(schemas[i][0], 'o', schemas[i][1], refs);
    }

    loadSchema(schema, id, content, refs);
  }
};
