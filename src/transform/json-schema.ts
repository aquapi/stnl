import type { TType, TString, TList, TObject, TTuple, TRef, TConst, TSchema, TTaggedUnion, TBasic, TExtendedBasic, TFloat, TInt } from '../index.js';

type Value = string | number | boolean | null;
type Keywords = '$defs' | '$ref' | 'minimum' | 'maximum' |
  'exclusiveMinimum' | 'exclusiveMaximum' | 'minLength' |
  'maxLength' | 'items' | 'prefixItems' | 'minItems' |
  'maxItems' | 'properties' | 'required' | 'type' |
  'const' | 'allOf' | 'anyOf';

type OutputSchema = Partial<{
  [x in Keywords]: Value | Value[] | Record<string, Value> | OutputSchema | OutputSchema[] | Record<string, OutputSchema>
}>;

export const loadTypeRecord = (rec: Record<string, TType>): OutputSchema => {
  const defs: OutputSchema = Object.create(rec);
  for (const key in defs) loadSchema(rec[key], defs[key as Keywords] = {});
  return defs;
};

export const loadObjectProps = (schema: TObject, output: OutputSchema): void => {
  // Required props
  let props = schema.props;
  if (props != null) {
    output.properties = loadTypeRecord(props);
    output.required = Object.keys(props);
  }

  // Optional props
  props = schema.optionalProps;
  if (props != null) {
    const tmp: Record<string, OutputSchema> | undefined = output.properties as any;

    if (tmp == null)
      output.properties = loadTypeRecord(props);
    else for (const itemKey in props) loadSchema(props[itemKey], tmp[itemKey] = {});
  }
};

export const loadType = (type: TBasic, output: OutputSchema): void => {
  switch (type.charCodeAt(0)) {
    // Any
    case 97:
      return;

    // Bool
    case 98:
      output.type = 'boolean';
      return;

    // Float
    case 102:
      output.type = 'number';
      return;

    // Signed integers
    case 105: {
      output.type = 'integer';

      const limit = 2 ** (+type.slice(1) - 1);
      output.minimum = -limit;
      output.maximum = limit - 1;

      return;
    }

    // String
    case 115:
      output.type = 'string';
      return;

    // Unsigned integers
    case 117: {
      output.type = 'integer';
      output.minimum = 0;
      // eslint-disable-next-line
      output.maximum = (2 ** +type.slice(1)) - 1;
      return;
    }
  }
};

export const loadRange = (schema: TInt | TFloat, output: OutputSchema): void => {
  if (schema.max != null)
    output.maximum = schema.max;
  if (schema.min != null)
    output.minimum = schema.min;
};

export function loadSchema(schema: TType, output: OutputSchema): void {
  if (typeof schema === 'string') {
    loadType(schema, output);
    return;
  }

  const isNil = schema.nullable === true;
  if (isNil)
    output.type = 'null';

  for (const key in schema) {
    if (key === 'type') {
      loadType((schema as TExtendedBasic).type, output);

      if (isNil)
        output.type = ['null', output.type as string];

      switch ((schema as TExtendedBasic).type.charCodeAt(0)) {
        // Float
        case 102:
          // Can override the value
          loadRange(schema as TFloat, output);
          if ((schema as TFloat).exclusiveMax != null)
            output.exclusiveMaximum = (schema as TFloat).exclusiveMax!;
          if ((schema as TFloat).exclusiveMin != null)
            output.exclusiveMinimum = (schema as TFloat).exclusiveMin!;

          return;

        // Integers
        case 105:
        case 117: {
          loadRange(schema as TInt, output);
          return;
        }

        // String
        case 115:
          if ((schema as TString).minLen != null)
            output.minLength = (schema as TString).minLen;
          if ((schema as TString).maxLen != null)
            output.maxLength = (schema as TString).maxLen;

          return;
      }
    } else if (key === 'item') {
      output.type = isNil ? ['null', 'array'] : 'array';

      const itemOutput: OutputSchema = {};
      loadSchema((schema as TList).item, itemOutput);
      output.items = itemOutput;

      if ((schema as TList).minLen != null)
        output.minItems = (schema as TString).minLen;
      if ((schema as TList).maxLen != null)
        output.maxItems = (schema as TString).maxLen;

      return;
    } else if (key === 'props' || key === 'optionalProps') {
      output.type = isNil ? ['null', 'object'] : 'object';
      loadObjectProps(schema as TObject, output);
      return;
    } else if (key === 'tag' || key === 'map') {
      output.type = isNil ? ['null', 'object'] : 'object';

      const tag = (schema as TTaggedUnion).tag;
      output.required = [tag];

      const cases: OutputSchema[] = [];
      const maps = (schema as TTaggedUnion).map;

      let outputTagSchema: OutputSchema;
      for (const tagVal in maps) {
        outputTagSchema = {};
        loadObjectProps(maps[tagVal], outputTagSchema);

        // @ts-expect-error Force set the tag
        (outputTagSchema.properties ??= {})[tag] = { const: tagVal };
        cases.push(outputTagSchema);
      }

      output.anyOf = cases;
      return;
    } else if (key === 'const') {
      output.const = (schema as TConst).const;
      return;
    } else if (key === 'ref') {
      // eslint-disable-next-line
      output.$ref = '#/$defs/' + (schema as TRef).ref;
      break;
    } else if (key === 'values') {
      output.type = isNil ? ['null', 'array'] : 'array';

      const schemas = (schema as TTuple).values;
      const vals: OutputSchema[] = new Array(schemas.length);
      for (let i = 0; i < schemas.length; i++) loadSchema(schemas[i], vals[i] = {});
      output.prefixItems = vals;

      return;
    }
  }
}

export type AnyJSONSchema = OutputSchema & {
  $schema: 'http://json-schema.org/draft-07/schema'
};

export default (schema: TSchema): AnyJSONSchema => {
  const output: AnyJSONSchema = {
    $schema: 'http://json-schema.org/draft-07/schema'
  };
  loadSchema(schema, output);

  if (schema.defs != null)
    output.$defs = loadTypeRecord(schema.defs);

  return output;
};
