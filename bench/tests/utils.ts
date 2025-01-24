export const randomStr = (l: number = 0) => {
  let str = '';

  while (l-- > 0) {
    str += Math.random();
  }

  return str;
}
