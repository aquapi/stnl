import type { TType, TBasic, TString, TList, TObject, TTuple, TRef, TConst, TSchema } from '../index.js';

export const loadSchema = (schema: TType, id: string, refs: Record<string, number>, isAlreadyString: boolean): string => {
  let str = schema.nullable === true ? `${id}===null?'null':` : '';

  for (const key in schema) {
    if (key === 'type') {
      // Handle primitives
      switch ((schema as TBasic | TString).type) {
        case 'int':
        case 'float':
        case 'bool':
          // Don't do unnecessary castings
          return str + (isAlreadyString ? id : `''+${id}`);

        case 'any':
        case 'string':
          return `${str}JSON.stringify(${id})`;
      }
    } else if (key === 'items') {
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
    } else if (key === 'allOf' || key === 'anyOf') {
      // Ain't no way I'm compiling this shit
      return `${str}JSON.stringify(${id})`;
    }
  }

  // eslint-disable-next-line
  return str + 'null';
};

export default (schema: TSchema, id: string, decls: string[]): string => {
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
