import { defineCase } from "@/utils";
import { createIs } from "typia";
import { createStringify } from "typia/lib/json";

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
      },
      items: number[]
    }>(),

    stringify: createStringify<{
      name: string,
      pwd: string,
      id: number[]
    }[]>()
  }
});
