import { InfoIcon } from '../icons/info';

export function AlertInfo({ content }: { content: string | string[] }) {
  const contentToRender = Array.isArray(content) ? content : [content];

  return (
    <div className="flex items-center bg-blue-100 border border-blue-300 gap-4 py-2 px-4 rounded-md">
      <InfoIcon
        customprops={{
          backgroundColor: '#2563eb', // blue-600
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
