export const randomStr = (l: number = 0) => {
  let str = '';

  while (l-- > 0) {
    str += Math.random();
  }

  return str;
}

export const randPick = <T>(arr: T[]): T => arr[Math.round(Math.random() * (arr.length - 1))];

export const randRemoveProp = <T>(x: T): void => {
  // @ts-ignore
  delete x[randPick(Object.keys(x))];
};
