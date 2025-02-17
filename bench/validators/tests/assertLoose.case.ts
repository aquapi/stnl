import { randomStr, randPick, randRemoveProp } from "./utils";

function trueValidator(this: { data: any }, fn: (o: any) => boolean) {
  if (!fn(this.data))
    throw new Error('A validator is invalid!');
}

function falseValidator(this: { data: any }, fn: (o: any) => boolean) {
  if (fn(this.data))
    throw new Error('A validator is invalid!');
}

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
    },
    items: new Array(3 + Math.round(Math.random() * 9)).fill(0).map(Math.random)
  },
  validate: trueValidator
});

const invalid = () => {
  const data = valid();
  randRemoveProp(data.data);
  data.validate = falseValidator;
  return data;
};

const deepInvalid = () => {
  const data = valid();
  randRemoveProp(data.data.deeplyNested);
  data.validate = falseValidator;
  return data;
}

export default Array.from({ length: 500 }, (_, i) => i % 10 === 0
  ? invalid()
  : i % 20 === 0
    ? deepInvalid()
    : valid()
);
