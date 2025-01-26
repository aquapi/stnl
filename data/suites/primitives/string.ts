import type { Suite } from "../../types";

export default <Suite[]>[
  {
    name: 'String with maxLen',
    schema: {
      type: 'string',
      maxLen: 8
    },
    tests: [
      {
        name: 'Match string with valid length',
        value: 'Hi',
        valid: true
      },
      {
        name: 'Do not match string too long',
        value: 'Lorem ipsum',
        valid: false
      }
    ]
  },

  {
    name: 'String with minLen',
    schema: {
      type: 'string',
      minLen: 2
    },
    tests: [
      {
        name: 'Match string with valid length',
        value: 'Hi',
        valid: true
      },
      {
        name: 'Do not match string too short',
        value: 'A',
        valid: false
      }
    ]
  },

  {
    name: 'String with minLen and maxLen',
    schema: {
      type: 'string',
      minLen: 2,
      maxLen: 8
    },
    tests: [
      {
        name: 'Match string with valid length',
        value: 'Hi',
        valid: true
      },
      {
        name: 'Do not match string too long',
        value: 'Lorem ipsum',
        valid: false
      },
      {
        name: 'Do not match string too short',
        value: 'A',
        valid: false
      }
    ]
  }
];
