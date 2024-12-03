import type { InferSchema } from '../lib/index.js';
import type { Equal, Expect } from './types.js';

type Output = InferSchema<{
  defs: {
    item: {
      props: {
        id: { type: 'int' }
      },
      optionalProps: {
        next: { ref: 'item' }
      }
    }
  };

  props: {
    name: { type: 'string' },
    age: { type: 'int' },
    pwd: {
      type: 'string',
      minLength: 8,
      maxLength: 64
    },
    item: { ref: 'item' }
  };
}>;

interface Item {
  id: number;
  next?: Item;
}

type Expected = {
  name: string,
  age: number,
  pwd: string,
  item: Item
};

export type T = Expect<Equal<Output>, Expected>;
