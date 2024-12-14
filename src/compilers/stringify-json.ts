import type { TType, TBasic, TString, TList, TObject, TTuple, TRef, TConst, TSchema } from '../index.js';

export const loadSchema = (schema: TType, id: string, content: string[], refs: Record<string, string>, isAlreadyString: boolean): void => {
  if (schema.nullable === true)
    content.push(`${id}===null?'null':`);

  for (const key in schema) {
    if (key === 'type') {
      // Handle primitives
      switch ((schema as TBasic | TString).type) {
        case 'int':
        case 'float':
        case 'bool':
          // Don't do unnecessary castings
          content.push(isAlreadyString ? id : `''+${id}`);
          return;

        case 'any':
        case 'string':
          content.push(`JSON.stringify(${id})`);
          return;
      }
    } else if (key === 'items') {
      // Handle arrays
      content.push(`("[" + ${id}.map((o)=>`);
      loadSchema((schema as TList).items, 'o', content, refs, true);
      content.push(').join() + "]")');

      return;
    } else if (key === 'props' || key === 'optionalProps') {
      content.push('"{"+(');

      // Optimal string concat
      let hasKeys = false;

      // Required props
      let props = (schema as TObject).props;
      if (typeof props !== 'undefined') {
        for (const itemKey in props) {
          content.push(`${hasKeys ? "+'," : "'"}"${itemKey}":'+(`);
          loadSchema(props[itemKey], `${id}.${itemKey}`, content, refs, true);
          content.push(')');

          hasKeys = true;
        }
      }

      const hasRequiredKeys = hasKeys;

      // Optional props
      props = (schema as TObject).optionalProps;
      if (typeof props !== 'undefined') {
        for (const itemKey in props) {
          content.push(`${hasKeys ? '+' : ''}(typeof ${id}.${itemKey}==="undefined"?"":',"${itemKey}":'+(`);
          loadSchema(props[itemKey], `${id}.${itemKey}`, content, refs, true);
          content.push('))');

          hasKeys = true;
        }
      }

      // Remove the leading ','
      content.push(`)${hasRequiredKeys ? '' : '.slice(1)'}+"}"`);
      return;
    } else if (key === 'const') {
      // Inline constants
      content.push(typeof (schema as TConst).const === 'string'
        ? JSON.stringify((schema as TConst).const)
        : `"${(schema as TConst).const}"`);
      break;
    } else if (key === 'ref') {
      // Search references
      content.push(`${refs[(schema as TRef).ref]}(${id})`);
      return;
    } else if (key === 'values') {
      // Handle tuples
      const schemas = (schema as TTuple).values;

      content.push('"["+(');
      loadSchema(schemas[0], `${id}[${0}]`, content, refs, true);

      for (let i = 1, l = schemas.length; i < l; i++) {
        content.push(')+(');
        loadSchema(schemas[i], `${id}[${i}]`, content, refs, true);
      }

      content.push(')+"]"');
      return;
    } else if (key === 'allOf' || key === 'anyOf') {
      // Ain't no way I'm compiling this shit
      content.push(`JSON.stringify(${id})`);
      return;
    }
  }
};

export default (schema: TSchema, id: string, content: string[], decls: string[][]): void => {
  if (typeof schema.defs === 'undefined')
    loadSchema(schema, id, content, null as unknown as Record<string, string>, false);
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
      for (let i = 0, l = schemas.length; i < l; i++) loadSchema(schemas[i][0], 'o', schemas[i][1], refs, false);
    }

    loadSchema(schema, id, content, refs, false);
  }
};
