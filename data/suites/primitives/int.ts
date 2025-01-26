import type { Suite, Test } from "../../types";

const MAX = 89;
const MIN = -56;

const validInt: Test = {
  name: 'Match valid integer',
  value: 0,
  valid: true
};

const invalidIntTooBig: Test = {
  name: 'Do not match integer too big',
  value: MAX + 1,
  valid: false
};

const invalidIntTooSmall: Test = {
  name: 'Do not match integer too small',
  value: MIN - 1,
  valid: false
};

export default <Suite[]>[
  {
    name: 'Integer with max',
    schema: {
      type: 'i32',
      max: MAX
    },
    tests: [
      validInt,
      invalidIntTooBig
    ]
  },

  {
    name: 'Integer with min',
    schema: {
      type: 'i32',
      min: MIN
    },
    tests: [
      validInt,
      invalidIntTooSmall
    ]
  },

  {
    name: 'Integer with max and min',
    schema: {
      type: 'i32',
      max: MAX,
      min: MIN
    },
    tests: [
      validInt,
      invalidIntTooBig,
      invalidIntTooSmall
    ]
  }
];
