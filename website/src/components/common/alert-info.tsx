import { cn } from '@nextui-org/react';
import { InfoIcon } from '../icons/info';
import { useTheme } from './use-theme';

export function AlertInfo({ content }: { content: string | string[] }) {
  const { isDarkTheme } = useTheme();
  const contentToRender = Array.isArray(content) ? content : [content];

  return (
    <div
      className={cn(
        'flex items-center gap-4 py-2 px-4 rounded-md',
        'bg-blue-100 dark:bg-cyan-800',
        'border border-blue-300 dark:border-cyan-600',
      )}
    >
      <InfoIcon
        customprops={{
          backgroundColor: isDarkTheme
            ? '#06b6d4' // cyan-500
            : '#2563eb', // blue-600
          iconColor: '#fff',
        }}
      />

      <div className="flex-1 flex flex-col gap-2 text-sm">
        {contentToRender.map((contentLine) => (
          <div key={contentLine}>{contentLine}</div>
        ))}
      </div>
    </div>
  );
}
