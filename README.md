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
