import { describe, test, expect } from 'bun:test';
import suites from '../data/suites';

import { build } from "../src/compilers/validate-json";
import compose from "../src/compilers/validate-json/compose";

for (const suite of suites) {
  describe(suite.name, () => {
    const fn = build(suite.schema);
    const composedFn = compose(suite.schema);

    for (const i of suite.tests) {
      test(i.name, () => {
        expect(fn(i.value)).toBe(i.valid);
        expect(composedFn(i.value)).toBe(i.valid);
      });
    }
  })
}

// createTest(
//   "Objects",
//   {
//     props: {
//       name: { type: "string", minLength: 3 },
//       age: { type: "int" },
//     },
//   },
//   [
//     [{ name: "admin", age: 20 }, true],
//     [{ name: "admin" }, false],
//     [{ name: "admin", age: 20.5 }, false],
//     [{ name: "ad", age: 20 }, false],
//     [{ age: 20 }, false],
//   ],
// );
// createTest(
//   "Tagged unions",
//   {
//     tag: "role",
//     maps: {
//       user: {
//         props: {
//           id: { type: "int" },
//         },
//       },

//       moderator: {
//         props: {
//           id: { type: "int" },
//           points: { type: "int" },
//         },
//       },
//     },
//   },
//   [
//     [{ role: "user", id: 1 }, true],
//     [{ role: "moderator", id: 2, points: 5 }, true],
//     [{ role: "moderator", id: 2 }, false],
//     [{ role: "user" }, false],
//     [{ role: "admin" }, false],
//   ],
// );
