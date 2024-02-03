import { InfoIcon } from '../icons/info';

export function AlertError({ content }: { content: string | string[] }) {
  const contentToRender = Array.isArray(content) ? content : [content];

  return (
    <div className="flex items-center bg-red-100 border border-red-300 gap-4 py-2 px-4 rounded-md">
      <InfoIcon
        customprops={{
          backgroundColor: '#dc2626', // red-600
          iconColor: '#fff',
        }}
      />

      <div className="flex-1 flex flex-col gap-2">
        {contentToRender.map((contentLine) => (
          <div key={contentLine}>{contentLine}</div>
        ))}
      </div>
    </div>
  );
}
