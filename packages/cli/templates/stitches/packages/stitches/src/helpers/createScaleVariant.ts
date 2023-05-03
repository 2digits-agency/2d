import { config } from '../stitches';
import type { CSS, Prefixed, Theme } from '../types';

export type TokenByScaleName<TScaleName extends keyof Theme> = Prefixed<
  '$',
  keyof Theme[TScaleName]
>;

export type ScaleVariant<TScaleName extends keyof Theme> = Record<keyof Theme[TScaleName], CSS>;

export type GetCss<TScaleName extends keyof Theme> = (token: TokenByScaleName<TScaleName>) => CSS;

export const createScaleVariant = <TScaleName extends keyof Theme>(
  scaleName: TScaleName,
  getCss: GetCss<TScaleName>,
): ScaleVariant<TScaleName> => {
  const scaleOptions = config.theme[scaleName];

  const variants = {} as ScaleVariant<TScaleName>;

  for (const scale in scaleOptions) {
    variants[scale] = getCss(`$${scale}` as TokenByScaleName<TScaleName>);
  }

  return variants;
};
