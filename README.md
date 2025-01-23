# Stnl
A JSON validator format.
```ts
import stnl, { type InferSchema } from 'stnl';

// Just a wrapper for type hint
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
`stnl` has compilers to convert the schema to other utilities.

### Assertion

To JIT compile a schema:
```ts
import { build } from 'stnl/compilers/validate-json';
import type { InferSchema, TSchema } from 'stnl';

const isUser = build(User);
isUser({ name: 'reve', age: 16, pwd: 'revenode' }); // true
```

To compile a schema without code generation:
```ts
import build from 'stnl/compilers/validate-json/compose';

const isUser = build(User);
isUser({ name: 'reve', age: 16, pwd: 'revenode' }); // true
```

### Stringify
To compile a JSON stringifier:
```ts
import { build } from 'stnl/compilers/stringify-json';
import type { InferSchema, TSchema } from 'stnl';

const stringifyUser = build(User);
stringifyUser({ name: 'reve', age: 16, pwd: 'revenode' });
```
