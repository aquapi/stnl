# Stnl
A JSON validator format.
```ts
import stnl, { type InferSchema } from 'stnl';

// A wrapper for type autocomplete
export const User = stnl({
  props: {
    name: {
      type: 'string',
      minLen: 3
    },
    age: 'u8',
    pwd: {
      type: 'string',
      minLen: 8,
      maxLen: 16
    }
  }
});

export type User = InferSchema<typeof User>;
```

## Compilers
`stnl` has compilers to compile the schema to other utilities.

### Assert

To JIT compile a schema to an assert function with code generation:
```ts
import { build } from 'stnl/compilers/validate-json';
import type { InferSchema, TSchema } from 'stnl';

const isUser = build(User);
isUser({ name: 'reve', age: 16, pwd: 'revenode' }); // true
```

To compile a schema to an assert function without code generation:
```ts
import build from 'stnl/compilers/validate-json/compose';

const isUser = build(User);
isUser({ name: 'reve', age: 16, pwd: 'revenode' }); // true
```

### Stringify
To JIT compile a schema to a JSON stringifier with code generation:
```ts
import { build } from 'stnl/compilers/stringify-json';
import type { InferSchema, TSchema } from 'stnl';

const stringifyUser = build(User);
stringifyUser({ name: 'reve', age: 16, pwd: 'revenode' });
```

To compile a schema to a JSON stringifier without code generation:
```ts
import build from 'stnl/compilers/stringify-json/compose';

const isUser = build(User);
isUser({ name: 'reve', age: 16, pwd: 'revenode' }); // true
```

You should benchmark which approach is faster as it depends on the runtime you're using.

## Transform

### JSON schema
To transform to a JSON schema for usage with other standards (such as OpenAPI).
```ts
import transform from 'stnl/transform/json-schema';

// Transform to a draft-7 JSON schema
transform(User);
```

The output JSON schema for the schema above will be:
```ts
{
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
    },
    age: {
      type: 'integer',
      minimum: 0,
      maximum: 255,
    },
    pwd: {
      type: 'string',
      minLength: 8,
      maxLength: 16,
    },
  },
  required: ['name', 'age', 'pwd']
}
```

Note that JSON schema compilation is significantly slower than stnl so only use this for compability reasons.

## Schemas

### Basic types
```ts
stnl('string'); // A JSON string
stnl('i8' | 'i16' | 'i32' | 'i64'); // Signed integers
stnl('u8' | 'u16' | 'u32' | 'u64'); // Unsigned integers
stnl('f32' | 'f64'); // Real numbers
```

### Strings
```ts
stnl({
  type: 'string',

  minLen: 2, // Set minimum length (optional)
  maxLen: 8 // Set maximum length (optional)
});
```

### Integers
```ts
stnl({
  type: 'i8', // Choose an integer type

  min: 2, // Set minimum value (optional)
  max: 8 // Set maximum value (optional)
});
```

### Floats
```ts
stnl({
  type: 'f32', // Choose a float type

  min: 2, // Set minimum value (optional)
  max: 8, // Set maximum value (optional)

  exclusiveMin: 2, // Set exclusive minimum value (optional)
  exclusiveMax: 8, // Set exclusive maximum value (optional)
});
```

### Objects
```ts
stnl({
  // Specify required properties (optional)
  props: {
    name: 'string'
  },

  // Specify optional properties (optional)
  optionalProps: {
    age: 'u8'
  }
});
```

### Arrays
```ts
stnl({
  item: 'u8', // A list of u8

  minLen: 2, // Set minimum length (optional)
  maxLen: 8 // Set maximum length (optional)
});
```

### Tuples
```ts
stnl({
  // A list with u8 as the first item
  // and u16 as the second item
  values: ['u8', 'u16']
});
```

### Intersections
```ts
stnl({
  // Match all of the schemas specified
  allOf: [
    {
      props: {
        name: 'string'
      }
    },
    {
      props: {
        pwd: 'string'
      }
    }
  ]
});
```

### Tagged unions
```ts
stnl({
  tag: 'role',
  map: {
    // When role = user
    user: {
      props: {
        points: 'i64'
      }
    },

    // When role = author
    author: {
      props: {
        reputation: 'i64'
      }
    }
  }
})
```
