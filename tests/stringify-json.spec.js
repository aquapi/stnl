import { test, expect } from "bun:test";
import stringifyJson from "../lib/compilers/stringify-json";

function build(schema) {
  const decls = [];
  const content = stringifyJson(schema, "o", decls);
  console.log(content);

  // eslint-disable-next-line
  return Function(
    `${decls.map((decl, i) => `'use strict';var d${i + 1}=${decl};`).join("")}return (o)=>${content};`,
  )();
}

function createTest(label, schema, tests) {
  test(label, () => {
    const fn = build(schema);
    for (const i of tests) expect(fn(i)).toBe(JSON.stringify(i));
  });
}

createTest("Primitives", { type: "int" }, [9, 16, 25, 90]);
createTest(
  "Objects",
  {
    props: {
      name: { type: "string" },
      age: { type: "int" },
    },
  },
  [{ name: "admin", age: 20 }],
);
createTest(
  "Tagged unions",
  {
    tag: "role",
    maps: {
      user: {
        props: {
          id: { type: "int" },
        },
      },

      moderator: {
        props: {
          id: { type: "int" },
          points: { type: "int" },
        },
      },
    },
  },
  [
    { role: "user", id: 1 },
    { role: "moderator", id: 2, points: 5 },
  ],
);
