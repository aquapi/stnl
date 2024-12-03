import type { InferSchema } from '../lib/index.js';
import type { Equal, Expect } from './types.js';

type Output = InferSchema<{
  defs: {
    link: {
      props: {
        id: { type: 'int' },
        items: {
          items: { ref: 'link' }
        }
      }
    }
  }

  ref: 'link'
}>;

interface Expected {
  id: number;
  items: Expected[];
}

export type T = Expect<Equal<Output, Expected>>;
