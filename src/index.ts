export type IntType = `${'i' | 'u'}${8 | 16 | 32 | 64}`;
export type FloatType = `f${32 | 64}`;

interface TBasicMap extends Record<IntType | FloatType, number> {
  bool: boolean;
  string: string;
  any: unknown;
}

export type TBasic = keyof TBasicMap;

export interface TInt {
  type: IntType;

  min?: number;
  max?: number;
}

export interface TFloat {
  type: FloatType;

  min?: number;
  max?: number;

  exclusiveMin?: number;
  exclusiveMax?: number;
}

export interface TString {
  type: 'string';

  minLen?: number;
  maxLen?: number;
}

export type TExtendedBasic = TString | TFloat | TInt;

export interface TRef {
  ref: string;
}

export interface TConst {
  const: string | number | boolean | null;
}

export interface TObject {
  props?: Record<string, TType>;
  optionalProps?: Record<string, TType>;
}

export interface TTuple {
  values: TTypeList;
}

export interface TList {
  item: TType;

  minLen?: number;
  maxLen?: number;
}

export interface TTaggedUnion {
  tag: string;
  map: Record<string, TObject>;
}

export type TType = ((
  TRef | TExtendedBasic | TConst | TObject | TTuple | TList | TTaggedUnion
) & {
  nullable?: boolean
}) | TBasic;

// Force list to be more than 1 item
export type TTypeList = [TType, ...TType[]];

export type TSchema = TType & {
  defs?: Record<string, TType>,
  meta?: unknown
};

declare const REFSYM: unique symbol;
interface Ref<T extends string> { [REFSYM]: T }

export type InferType<T extends TType> =
  T extends TBasic ? TBasicMap[T] :
    T extends TExtendedBasic ? TBasicMap[T['type']] :
      T extends TConst ? T['const'] :
        T extends TObject ? InferObject<T> :
          T extends TTuple ? InferList<T['values']> :
            T extends TList ? InferType<T['item']>[] :
              T extends TTaggedUnion ? InferMaps<T['map'], T['tag']> :
                T extends TRef ? Ref<T['ref']> : unknown;

export type InferObject<T extends TObject> = {
  [K in keyof T['props']]: InferType<(T['props'] & {})[K]>
} & {
  [K in keyof T['optionalProps']]?: InferType<(T['optionalProps'] & {})[K]>
};

export type InferMaps<T extends TTaggedUnion['map'], Tag extends string> = {
  [K in keyof T]: Record<Tag, K> & InferObject<T[K]>
}[keyof T];

export type InferList<T extends TType[]> =
  T extends [infer F extends TType, ...infer R extends TType[]]
    // @ts-expect-error It's not infinite
    ? [InferType<F>, ...InferList<R>] : [];

export type InferDefs<T extends TSchema> = {
  [K in keyof T['defs']]: InferType<(T['defs'] & {})[K]>
};

export type InferSchema<T extends TSchema> = LoadRef<InferType<T>, InferDefs<T>>;

export type LoadRef<T, R extends Record<string, any>> =
  T extends Ref<infer L> ? LoadRef<R[L], R> :
    T extends Record<string | number | symbol, any> ? { [K in keyof T]: LoadRef<T[K], R> } : T;

/**
 * Create a schema
 */
export default <const T extends TSchema>(x: T): T => x;
