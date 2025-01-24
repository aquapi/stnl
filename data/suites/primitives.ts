import type { Suite, Test } from '../types';
import { negates } from '../utils';

const objectTests: Test[] = [
  {
    name: 'Match object',
    value: { foo: 'bar' },
    valid: true
  },
  {
    name: 'Match empty object',
    value: {},
    valid: true
  },
  {
    name: 'Match array',
    value: ['foo', 'bar'],
    valid: true
  },
  {
    name: 'Match empty array',
    value: [],
    valid: true
  }
];

const nullTest: Test = {
  name: 'Match null',
  value: null,
  valid: true
};

const stringTests: Test[] = [
  {
    name: 'Match empty string',
    value: "",
    valid: true
  },
  {
    name: 'Match string',
    value: "strlen",
    valid: true
  },
];

const boolTests: Test[] = [
  {
    name: 'Match true',
    value: true,
    valid: true
  },
  {
    name: 'Match false',
    value: false,
    valid: true
  },
];

const intTests: Test[] = [
  {
    name: 'Match positive integer',
    value: 98,
    valid: true
  },
  {
    name: 'Match negative integer',
    value: -179,
    valid: true
  },
  {
    name: 'Match 0',
    value: 0,
    valid: true
  },
];

const floatTests: Test[] = [
  {
    name: 'Match positive float',
    value: 89.56,
    valid: true
  },
  {
    name: 'Match negative float',
    value: -17.45,
    valid: true
  },
];

export default <Suite[]>[
  {
    name: 'Integer',
    schema: 'i64',
    tests: [
      ...intTests,
      ...negates([
        nullTest,
        ...stringTests,
        ...floatTests,
        ...boolTests,
        ...objectTests
      ])
    ]
  },

  {
    name: 'Float',
    schema: 'f64',
    tests: [
      ...intTests,
      ...floatTests,
      ...negates([
        nullTest,
        ...stringTests,
        ...boolTests,
        ...objectTests
      ])
    ]
  },

  {
    name: 'Bool',
    schema: 'bool',
    tests: [
      ...boolTests,
      ...negates([
        nullTest,
        ...stringTests,
        ...intTests,
        ...floatTests,
        ...objectTests
      ])
    ]
  },

  {
    name: 'String',
    schema: 'string',
    tests: [
      ...stringTests,
      ...negates([
        nullTest,
        ...boolTests,
        ...floatTests,
        ...objectTests
      ])
    ]
  },

  {
    name: 'Any',
    schema: 'any',
    tests: [
      ...stringTests,
      ...boolTests,
      ...floatTests,
      ...objectTests,
      nullTest,
    ]
  },

  {
    name: 'Null',
    schema: { const: null },
    tests: [
      nullTest,
      ...negates([
        ...stringTests,
        ...boolTests,
        ...floatTests,
        ...objectTests
      ])
    ]
  }
];
