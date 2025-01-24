# Stnl
A JSON validator format.
```ts
import stnl, { type InferSchema } from 'stnl';

// A wrapper for type autocomplete
export const User = stnl({
  props: {
    name: {
      type: 'string',
      minLength: 3
    },
    age: 'int',
    pwd: {
      type: 'string',
      minLength: 8,
      maxLength: 16
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
