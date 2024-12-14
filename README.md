# Stnl
A validator format.
```ts
import schema, { type InferSchema } from 'stnl';

export const User = schema({
  props: {
    name: {
      type: 'string',
      minLength: 3
    },
    age: {
      type: 'int'
    },
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

Example usage:
```ts
import validateJson from 'stnl/compilers/validate-json';
import type { InferSchema, TSchema } from 'stnl';

function buildValidator<T extends TSchema>(schema: T): (o: any) => o is InferSchema<T> {
  const builder: string[] = [];
  const decls: string[][] = [];

  validateJson(schema, 'o', builder, decls);

  // eslint-disable-next-line
  return Function(`${decls.map((decl, i) => `'use strict';var d${i + 1}=${decl.join('')};`).join('')}return (o)=>${builder.join('')};`)();
}

const isUser = buildValidator(User);
isUser({ name: 'reve', age: 16, pwd: 'revenode' }); // true
```
