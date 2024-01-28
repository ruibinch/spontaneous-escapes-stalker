import { useCallback, useEffect, useState } from 'react';

interface Props {
  rowsPerPage: number;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function TableRowsPerPage({ rowsPerPage, onRowsPerPageChange }: Props) {
  return (
    <label className="items-center text-default-400 text-small">
      Rows per page:
      <select
        className="bg-transparent outline-none text-default-400 text-small"
        value={rowsPerPage}
        onChange={onRowsPerPageChange}
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </label>
  );
}

export function useRowsPerPageHandler<T extends unknown>(data: T[]) {
  const [numRowsDisplayed, setNumRowsDisplayed] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currPage, setCurrPage] = useState(1);
  const pages = Math.ceil(data.length / rowsPerPage);

  useEffect(() => {
    // reset all rows/pagination props if number of entries has changed
    if (numRowsDisplayed !== undefined && data.length !== numRowsDisplayed) {
      setRowsPerPage(10);
      setCurrPage(1);
    }
    setNumRowsDisplayed(data.length);
  }, [data, numRowsDisplayed]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setCurrPage(1);
    },
    [],
  );

  const startIdx = (currPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;

  return {
    rowsPerPage,
    currPage,
    setCurrPage,
    pages,
    startIdx,
    endIdx,
    onRowsPerPageChange,
  };
}
