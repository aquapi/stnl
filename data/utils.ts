import type { Test } from './types';

export const negate = (t: Test) => ({
  name: 'Do not ' + t.name.toLowerCase(),
  value: t.value,
  valid: !t.valid
});

export const negates = (t: Test[]) => t.map(negate);
