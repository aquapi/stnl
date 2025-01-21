import type { Tests } from "./defineCase";

const randomStr = (l: number = 0) => {
  let str = '';

  while (l-- > 0) {
    str += Math.random();
  }

  return str;
}

export default {
  assertLoose: (() => {
    const valid = () => ({
      data: {
        number: Math.random() * 18,
        negNumber: Math.random() * -20,
        maxNumber: Number.MAX_VALUE,
        string: randomStr(),
        longString: randomStr(8),
        boolean: Math.random() < 0.5,
        deeplyNested: {
          foo: randomStr(),
          num: Math.random() * 78,
          bool: Math.random() > 0.5
        }
      },
      valid: true
    });

    return Array.from({ length: 500 }, valid);
  })()
} as Record<keyof Tests, {
  data: {},
  valid: boolean
}[]>;
