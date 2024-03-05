import { Pagination } from '@nextui-org/react';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  pages: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  useBasicDesign?: boolean;
}

export function TablePagination({
  pages,
  page,
  setPage,
  useBasicDesign = false,
}: Props) {
  return (
    <div className="py-2 px-2 flex justify-end">
      <Pagination
        size="sm"
        color="primary"
        isCompact
        showControls
        showShadow={!useBasicDesign}
        page={page}
        total={pages}
        onChange={setPage}
        classNames={{
          wrapper: 'gap-0 overflow-visible h-8 rounded border border-divider',
          item: 'w-8 h-8 text-small rounded-none bg-transparent',
          cursor:
            'bg-gradient-to-b shadow-lg from-blue-500 to-blue-800 dark:from-blue-300 dark:to-blue-600 text-white font-semibold',
        }}
      />
    </div>
  );
}
