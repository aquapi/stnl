export type NumberType = `${'i' | 'u'}${8 | 16 | 32 | 64}` | `f${32 | 64}`;

export interface TBasicMap extends Record<NumberType, number> {
  bool: boolean;
  string: string;
  any: unknown;
}

export interface TRef {
  ref: string;
}

export interface TConst {
  const: string | number | boolean | bigint | null;
}

export interface TString {
  type: 'string';

  minLen?: number;
  maxLen?: number;
}

export interface TObject {
  props?: Record<string, TType>;
  optionalProps?: Record<string, TType>;
}

export interface TTuple {
  values: TType[];
}

export interface TList {
  items: TType;

  minLen?: number;
  maxLen?: number;
}

export interface TUnion {
  anyOf: TTypeList;
}

export interface TIntersection {
  allOf: TTypeList;
}

export interface TTaggedUnion {
  tag: string;
  maps: Record<string, TObject>;
}

export type TType = ((
  TRef | TString | TConst | TObject | TTuple | TList | TUnion | TIntersection | TTaggedUnion
) & {
  nullable?: boolean
}) | keyof TBasicMap;

// Force list to be more than 1 item
export type TTypeList = [TType, ...TType[]];

export type TSchema = TType & {
  defs?: Record<string, TType>,
  meta?: unknown
};

declare const REFSYM: unique symbol;
interface Ref<T extends string> { [REFSYM]: T }

export type InferType<T extends TType> =
  T extends keyof TBasicMap ? TBasicMap[T] :
    T extends TConst ? T['const'] :
      T extends TObject ? InferObject<T> :
        T extends TTuple ? InferList<T['values']> :
          T extends TList ? InferType<T['items']>[] :
            T extends TUnion ? InferUnion<T['anyOf']> :
              T extends TIntersection ? InferIntersection<T['allOf']> :
                T extends TTaggedUnion ? InferMaps<T['maps'], T['tag']> :
                  T extends TRef ? Ref<T['ref']> : unknown;

export type InferObject<T extends TObject> = {
  [K in keyof T['props']]: InferType<(T['props'] & {})[K]>
} & {
  [K in keyof T['optionalProps']]?: InferType<(T['optionalProps'] & {})[K]>
};

export type InferMaps<T extends TTaggedUnion['maps'], Tag extends string> = {
  [K in keyof T]: Record<Tag, K> & InferObject<T[K]>
}[keyof T];

export type InferList<T extends TType[]> =
  T extends [infer F extends TType, ...infer R extends TType[]]
    // @ts-expect-error It's not infinite
    ? [InferType<F>, ...InferList<R>] : [];

export type InferUnion<T extends TType[]> =
  T extends [infer F extends TType, ...infer R extends TType[]]
    ? InferType<F> | InferUnion<R> : never;

export type InferIntersection<T extends TType[]> =
  T extends [infer F extends TType, ...infer R extends TType[]]
    ? InferType<F> & InferIntersection<R> : any;

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
