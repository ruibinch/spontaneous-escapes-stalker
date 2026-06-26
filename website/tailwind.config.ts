import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';
import { CSSRuleObject, PluginAPI } from 'tailwindcss/types/config';

const toRgba = (hexCode: string, opacity = 50) => {
  let hex = hexCode.replace('#', '');

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b, opacity / 100];
};

const flattenColorPalette = (obj: Record<string, unknown>, sep = '-') =>
  Object.assign(
    {},
    ...(function _flatten(o: Record<string, unknown>, p = ''): unknown[] {
      return [].concat(
        // @ts-expect-error hard to type properly
        ...Object.keys(o).map((k) =>
          typeof o[k] === 'object'
            ? _flatten(o[k] as Record<string, unknown>, k + sep)
            : { [p + k]: o[k] },
        ),
      );
    })(obj),
  );

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': '0.625rem',
        stat: ['1.75rem', { lineHeight: '2rem', fontWeight: '700' }],
      },
      lineHeight: {
        '2xs': '0.75rem',
      },
      colors: {
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          subtle: 'var(--color-accent-subtle)',
        },
        deal: {
          good: 'var(--color-deal-good)',
          caution: 'var(--color-deal-caution)',
          poor: 'var(--color-deal-poor)',
        },
        nav: {
          bg: 'var(--color-nav-bg)',
          text: 'var(--color-nav-text)',
          'text-active': 'var(--color-nav-text-active)',
          'active-bg': 'var(--color-nav-active-bg)',
          hover: 'var(--color-nav-hover)',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui(),
    // Reference: https://play.tailwindcss.com/QNkCU1z1UX?file=config
    function ({ addUtilities, theme }: PluginAPI) {
      const utilities: CSSRuleObject = {
        '.bg-stripes': {
          backgroundImage:
            'linear-gradient(135deg, var(--stripes-color) 25%, transparent 25%, transparent 50%, var(--stripes-color) 50%, var(--stripes-color) 75%, transparent 75%, transparent 100%)',
          backgroundSize: '7px 7px',
        },
      };

      const addColor = (name: string, color: string) =>
        (utilities[`.bg-stripes-${name}`] = { '--stripes-color': color });

      const colors = flattenColorPalette(theme('backgroundColor'));
      for (let name in colors) {
        try {
          const [r, g, b, a] = toRgba(colors[name]);
          if (a !== undefined) {
            addColor(name, colors[name]);
          } else {
            addColor(name, `rgba(${r}, ${g}, ${b}, 0.4)`);
          }
        } catch (_) {
          addColor(name, colors[name]);
        }
      }

      addUtilities(utilities);
    },
  ],
};

export default config;
