import * as React from 'react';
import { Table } from 'reactstrap';
import Moment from 'react-moment';
import Link from 'next/link';
import MainPaginate from '@components/paginate/main-paginate';
import { toast } from 'react-toastify';
import { sellItemService } from '@services/sell-item.service';
import { useRouter } from 'next/router';
import FormFilter from './form-filter';

interface IProps {
  type: string;
}

const TableSellItems: React.FunctionComponent<IProps> = ({
  type
}) => {
  const [query, setQuery] = React.useState({
    page: 1,
    take: 12,
    sortBy: 'createdAt',
    sortType: 'desc',
    userId: '',
    isApproved: ''
  });

  const route = useRouter();
  const [total, setTotal] = React.useState(0);
  const [sellItems, setSellitems] = React.useState({} as any);

  const loadSellItems = async () => {
    try {
      const resp = await sellItemService.getList({ ...query, mediaType: type });
      setSellitems(resp.data.items);
      setTotal(resp.data.count);
    } catch (e) {
      const err = await e;
      toast.error(err?.messsage || 'Load media content failed!');
    }
  };
  const onFilter = (values: any) => {
    setQuery({
      ...query,
      userId: values.userId,
      page: 1,
      isApproved: values.isApproved
    });
  };

  const removeItem = async (id: string) => {
    try {
      await sellItemService.remove(id);
      toast.success('Element löschen erfolgreich!');
      loadSellItems();
    } catch (e) {
      const err = await e;
      toast.error(err?.message || 'Das Löschen des Elements ist fehlgeschlagen!');
    }
  };

  React.useEffect(() => {
    loadSellItems();
  }, [query, type]);

  React.useEffect(() => {
    setQuery({ ...query, page: 1 });
  }, [route]);

  return (
    <>
      <FormFilter key="form" filter={onFilter} />
      <Table responsive striped borderless key="table">
        <thead>
          <tr>
            <th>Miniaturansicht</th>
            <th className="">Category</th>
            <th className="th-name">Name</th>
            <th>Preis (Token)</th>
            <th>Modell</th>
            <th>Status</th>
            <th>Hochgeladen am</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {sellItems && sellItems.length ? (
            sellItems.map(
              (item: any, index: number) => item.media && (
              <tr key={index as any}>
                <td>
                  {item.media && item.media.thumbUrl && item.mediaType === 'photo' ? (
                    <img alt="" src={item.media.thumbUrl} width="100px" />
                  ) : item.media && item.mediaType === 'video' && (
                  <img
                    alt=""
                    src={item.media.thumbUrl ? item.media.thumbUrl : '/images/video-img.png'}
                    width="100px"
                  />
                  )}
                </td>
                <td>{item.category && item.category || 'none'}</td>
                <td>{item.media && item.name}</td>
                <td>{item.price}</td>
                <td>{item.model && item.model.username}</td>
                <td>{item.isApproved ? 'Approve' : 'Pending'}</td>
                <td>
                  <Moment format="YYYY-MM-DD">{item.createdAt}</Moment>
                </td>
                <td>
                  <Link href="/sell-items/[id]/update" as={`/sell-items/${item._id}/update`}>
                    <i className="fa fa-pencil-alt " />
                  </Link>
                          &nbsp;
                  <a
                    href="#"
                    onClick={() => {
                      if (window.confirm('Are you sure?')) removeItem(item._id);
                    }}
                  >
                    <i className="fa fa-trash" />
                  </a>
                </td>
              </tr>
              )
            )
          ) : (
            <tr key="non sell item">
              <td>Kein Artikel zum Anzeigen</td>
            </tr>
          )}
        </tbody>
      </Table>
      {total > 0 && total > query.take
              && (
                <MainPaginate
                  currentPage={query.page}
                  pageTotal={total}
                  pageNumber={query.take}
                  setPage={(page) => setQuery({ ...query, page })}
                />
              )}
    </>
  );
};
export default TableSellItems;
