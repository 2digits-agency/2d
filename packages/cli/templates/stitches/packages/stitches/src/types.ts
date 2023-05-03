import type {
  CSS as StitchesCSS,
  CSSProperties as StitchesCSSProperties,
  PropertyValue as StitchesPropertyValue,
  ScaleValue as StitchesScaleValue,
} from '@stitches/react';

import type { config } from './stitches';

export type { FontFace, CSSProperties, VariantProps, ComponentProps } from '@stitches/react';

export type Config = typeof config;

export type Theme = Config['theme'];

export type CSS = StitchesCSS<Config>;

export type PropertyValue<TProperty extends keyof StitchesCSSProperties> = StitchesPropertyValue<
  TProperty,
  Config
>;

export type ScaleValue<TScale> = StitchesScaleValue<TScale, Config>;

export type Prefixed<TPrefix extends string, TValue> = `${TPrefix}${Extract<
  TValue,
  boolean | number | string
>}`;
