import { Pagination } from '@nextui-org/react';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  pages: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
}

export function TablePagination({ pages, page, setPage }: Props) {
  return (
    <div className="py-2 px-2 flex justify-end">
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={pages}
        onChange={setPage}
      />
    </div>
  );
}
