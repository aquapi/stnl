import { defineCase } from "@/utils";
import { createIs } from "typia";

export default defineCase({
  name: 'typia - aot',
  tests: {
    assertLoose: createIs<{
      number: number,
      negNumber: number,
      maxNumber: number,
      string: string,
      longString: string,
      boolean: boolean,
      deeplyNested: {
        foo: string,
        num: number,
        bool: boolean
      }
    }>()
  }
});
