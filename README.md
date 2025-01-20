# Stnl
A JSON validator format.
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
  const decls: string[][] = [];
  const content = validateJson(schema, 'o', builder, decls);

  // Same stuff as what '@mapl/compiler' does
  return Function(`'use strict';${decls.map((decl, i) => `var d${i + 1}=${decl.join('')};`).join('')}return (o)=>${content)};`)();
}

const isUser = buildValidator(User);
isUser({ name: 'reve', age: 16, pwd: 'revenode' }); // true
```
