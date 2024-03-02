import { cn } from '@nextui-org/react';
import { Dispatch, SetStateAction } from 'react';

export interface ToggleProps<T> {
  size?: 'sm' | 'md';
  options: {
    key: T;
    label: string;
    backgroundStyle?: string; // for additional option-specific custom styles
  }[];
  title?: string;
  selValue: T;
  setSelValue: Dispatch<SetStateAction<T>>;
}

export function Toggle<T>({
  size = 'md',
  options,
  title,
  selValue,
  setSelValue,
}: ToggleProps<T>) {
  if (options.length !== 2) {
    throw new Error('Too many options for a Toggle component');
  }

  const handleToggle = (value: T) => {
    setSelValue(value);
  };

  const addBackgroundStyle = (value: T) =>
    cn(
      'border-y hover:border-blue-600',
      size === 'md' ? 'px-4 py-0.5' : 'px-3',
      value === selValue ? 'border-blue-600 bg-blue-50' : 'border-neutral-400',
      options.find((opt) => opt.key === value)?.backgroundStyle,
    );

  const addTextStyle = (value: T) =>
    cn(
      'hover:text-blue-600',
      size === 'md' ? 'text-sm' : 'text-xs',
      value === selValue ? 'text-blue-600 font-medium' : '',
    );

  return (
    <div className="flex flex-col gap-1">
      {title && <span className="text-default-400 text-small">{title}</span>}
      <a className="flex cursor-pointer">
        <div
          className={cn(
            'rounded-l-md border-l',
            addBackgroundStyle(options[0].key),
          )}
          onClick={() => {
            handleToggle(options[0].key);
          }}
        >
          <span className={addTextStyle(options[0].key)}>
            {options[0].label}
          </span>
        </div>
        <div className="border-l-1 border-blue-600" />
        <div
          className={cn(
            'rounded-r-md border-r',
            addBackgroundStyle(options[1].key),
          )}
          onClick={() => {
            handleToggle(options[1].key);
          }}
        >
          <span className={addTextStyle(options[1].key)}>
            {options[1].label}
          </span>
        </div>
      </a>
    </div>
  );
}
