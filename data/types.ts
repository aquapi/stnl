import type { TSchema } from '../src';

export interface Test {
  name: string,
  value: any,
  valid: boolean
}

export interface Suite {
  name: string,
  schema: TSchema,
  tests: Test[]
}
