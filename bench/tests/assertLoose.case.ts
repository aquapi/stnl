import { randomStr } from "./utils";

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

export default Array.from({ length: 500 }, valid);
