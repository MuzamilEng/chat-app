import { useTranslationContext } from 'context/TranslationContext';
import MainPaginate from 'src/components/paginate/main-paginate';

interface IProps {
  changePage: Function;
  page: number;
  take: number;
  total: number;
}
function TableFooterBasic({
  changePage, page, take, total
}: IProps) {
  const { t, lang } = useTranslationContext();
  return (
    <div className="row pagin flex w-100 mt-3">
      <div className="col-sm-12 col-md-6 m-0">
        {total > 0 && (
        <span>
          {lang === 'en' ? 'Showing' : 'Anzeigen'}
          {' '}
          {(page - 1) * take + 1}
          {' '}
          to
          {' '}
          {page * take > total ? total : page * take}
          {' '}
          of
          {' '}
          {total}
          {' '}
          {lang === 'en' ? 'Entries' : 'Einträge'}
        </span>
        )}
      </div>
      <div className="col-sm-12 col-md-6 pagin-box flex justify-content-end">
        {total > 0 && total > take && (
        <MainPaginate currentPage={page} pageTotal={total} pageNumber={take} setPage={(data) => changePage({ data })} />
        )}
      </div>
    </div>
  );
}

export default TableFooterBasic;
