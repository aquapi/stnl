export interface Tests {
  assertLoose: (o: any) => boolean
}

export interface Case {
  name: string,
  tests: Partial<Tests>
}

export default <const T extends Case>(t: T) => t;
