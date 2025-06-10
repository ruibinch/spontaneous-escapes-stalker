import { cn } from '@heroui/react';
import { InfoIcon } from '../icons/info';
import { useTheme } from './use-theme';

export function AlertError({ content }: { content: string | string[] }) {
  const { isDarkTheme } = useTheme();
  const contentToRender = Array.isArray(content) ? content : [content];

  return (
    <div
      className={cn(
        'flex items-center gap-4 py-2 px-4 rounded-md',
        'bg-red-100 dark:bg-red-700',
        'border border-red-300 dark:border-red-600',
      )}
    >
      <InfoIcon
        customprops={{
          backgroundColor: isDarkTheme
            ? '#f87171' // red-400
            : '#dc2626', // red-600
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
