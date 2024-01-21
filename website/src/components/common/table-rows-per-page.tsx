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
