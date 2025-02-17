import type { Tests } from "./utils";

export const excludeCase = (name: string) => false;
export const includeCase = (name: string) => true;

export const excludeTest = (name: keyof Tests) => name === 'assertLoose';
export const includeTest = (name: keyof Tests) => true;
