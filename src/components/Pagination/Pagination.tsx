import ReactPaginateDefault from "react-paginate";

import css from "./Pagination.module.css";

const ReactPaginate =
  (ReactPaginateDefault as unknown as { default?: typeof ReactPaginateDefault })
    .default ?? ReactPaginateDefault;

interface PaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

interface PageChangeEvent {
  selected: number;
}

const Pagination = ({
  currentPage,
  pageCount,
  onPageChange,
}: PaginationProps) => {
  const handlePageChange = (event: PageChangeEvent): void => {
    onPageChange(event.selected + 1);
  };

  return (
    <ReactPaginate
      pageCount={pageCount}
      forcePage={currentPage - 1}
      onPageChange={handlePageChange}
      containerClassName={css.pagination}
      activeClassName={css.active}
      pageRangeDisplayed={5}
      marginPagesDisplayed={1}
      previousLabel="<"
      nextLabel=">"
      breakLabel="..."
    />
  );
};

export default Pagination;
