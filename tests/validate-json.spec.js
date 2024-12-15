import { test, expect } from "bun:test";
import validateJson from "../lib/compilers/validate-json";

function build(schema) {
  const decls = [];
  const content = validateJson(schema, "o", decls);

  // eslint-disable-next-line
  return Function(
    `${decls.map((decl, i) => `'use strict';var d${i + 1}=${decl.join("")};`).join("")}return (o)=>${content};`,
  )();
}

function createTest(label, schema, tests) {
  test(label, () => {
    const fn = build(schema);
    console.log(fn.toString());
    for (const i of tests) expect(fn(i[0])).toBe(i[1]);
  });
}

createTest("Primitives", { type: "int" }, [
  [9, true],
  [16, true],
  ["", false],
  [null, false],
  [19.2, false],
]);
createTest(
  "Objects",
  {
    props: {
      name: { type: "string", minLength: 3 },
      age: { type: "int" },
    },
  },
  [
    [{ name: "admin", age: 20 }, true],
    [{ name: "admin" }, false],
    [{ name: "admin", age: 20.5 }, false],
    [{ name: "ad", age: 20 }, false],
    [{ age: 20 }, false],
  ],
);
