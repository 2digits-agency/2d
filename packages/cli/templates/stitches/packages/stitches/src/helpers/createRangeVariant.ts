import type { CSS } from '../types';

type InnerNumberRange<
  TNumber extends number,
  TRange extends unknown[],
> = TRange['length'] extends TNumber
  ? TRange['length']
  : InnerNumberRange<TNumber, [TNumber, ...TRange]> | TRange['length'];

type NumberRange<TRange extends number> = number extends TRange
  ? number
  : InnerNumberRange<TRange, []>;

export type RangeVariant<TLength extends number> = Record<NumberRange<TLength>, CSS>;

export const createRangeVariant = <TLength extends number>(
  from: number,
  length: TLength,
  get: (index: number) => CSS,
): RangeVariant<TLength> => {
  const ranges: Record<number, CSS> = {};

  for (let index = from; index < from + length; index++) {
    ranges[index] = get(index);
  }

  return ranges;
};
