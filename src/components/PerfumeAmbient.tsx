import type { CSSProperties } from 'react';

type PerfumeAmbientProps = {
  scentId: string;
};

const themes: Record<string, { main: string; secondary: string; moon: string }> = {
  'oud-noir': {
    main: 'rgba(191, 116, 37, 0.30)',
    secondary: 'rgba(98, 45, 14, 0.24)',
    moon: 'rgba(232, 171, 83, 0.32)',
  },
  'lavande-de-nuit': {
    main: 'rgba(122, 89, 191, 0.28)',
    secondary: 'rgba(67, 42, 120, 0.24)',
    moon: 'rgba(193, 176, 255, 0.28)',
  },
  'rose-eternelle': {
    main: 'rgba(185, 77, 110, 0.27)',
    secondary: 'rgba(112, 36, 62, 0.24)',
    moon: 'rgba(255, 191, 207, 0.25)',
  },
  'jasmin-blanc': {
    main: 'rgba(161, 178, 101, 0.22)',
    secondary: 'rgba(74, 101, 53, 0.24)',
    moon: 'rgba(248, 242, 206, 0.23)',
  },
  'safran-dor': {
    main: 'rgba(181, 91, 40, 0.29)',
    secondary: 'rgba(126, 53, 28, 0.25)',
    moon: 'rgba(255, 190, 92, 0.30)',
  },
  'encens-royal': {
    main: 'rgba(160, 117, 48, 0.27)',
    secondary: 'rgba(74, 52, 28, 0.25)',
    moon: 'rgba(242, 215, 157, 0.25)',
  },
  'santal-ambre': {
    main: 'rgba(166, 98, 42, 0.27)',
    secondary: 'rgba(89, 49, 22, 0.26)',
    moon: 'rgba(242, 195, 118, 0.28)',
  },
};

/**
 * Static, CSS-only visual layer inspired by the provided moon, flowing silk,
 * and rain-on-glass concepts. It has no canvas, WebGL, timer, or animation,
 * so it can sit behind every transparent perfume PNG without slowing mobile.
 */
export default function PerfumeAmbient({ scentId }: PerfumeAmbientProps) {
  const theme = themes[scentId] ?? themes['oud-noir'];
  const style = {
    '--ambient-main': theme.main,
    '--ambient-secondary': theme.secondary,
    '--ambient-moon': theme.moon,
  } as CSSProperties;

  return (
    <span className="perfume-ambient" aria-hidden="true" style={style}>
      <span className="perfume-ambient__moon" />
      <span className="perfume-ambient__flow" />
      <span className="perfume-ambient__rain" />
    </span>
  );
}
