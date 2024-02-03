import { SvgIconProps } from './types';

export const InfoIcon = (
  props: SvgIconProps & {
    customprops?: {
      backgroundColor: string;
      iconColor: string;
    };
  },
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={props.customprops?.backgroundColor ?? 'none'}
    stroke={props.customprops?.backgroundColor ?? 'currentColor'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line
      x1="12"
      y1="16"
      x2="12"
      y2="12"
      stroke={props.customprops?.iconColor ?? 'currentColor'}
    ></line>
    <line
      x1="12"
      y1="8"
      x2="12.01"
      y2="8"
      stroke={props.customprops?.iconColor ?? 'currentColor'}
    ></line>
  </svg>
);
