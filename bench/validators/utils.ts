export interface Tests {
  assertLoose: (o: any) => boolean,
  stringify: (o: any) => string
}

export interface Case {
  name: string,
  tests: Partial<Tests>
}

export const defineCase = <const T extends Case>(t: T) => t;
export const ROOT = import.meta.dir;
export const TSCONFIG = ROOT + '/tsconfig.json';
