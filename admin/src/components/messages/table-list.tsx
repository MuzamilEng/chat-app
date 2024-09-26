import * as React from 'react';
import { Table } from 'reactstrap';
import Moment from 'react-moment';
import { toast } from 'react-toastify';
import { messageService } from '@services/message.service';
import MainPaginate from '@components/paginate/main-paginate';
import FormFilter from './form-filter';
import { useRouter } from 'next/navigation';

const initialQuery = {
  page: 1,
  take: 10,
  sortBy: 'createdAt',
  sortType: 'desc',
  userId: '',
  modelId: ''
} as any;

function TableMessages() {
  const navigate = useRouter();
  const [query, setQuery] = React.useState(initialQuery);
  const [totalMessage, setTotalMessage] = React.useState(0);
  const [dataMessage, setDataMessage] = React.useState({} as any);
  const [findMessageQuery, setFindMessageQuery] = React.useState({} as any);

  const loadMessages = async () => {
    try {
      const resp = await messageService.getList(query);
      setTotalMessage(resp.data.count);
      setDataMessage(resp.data.items);
    } catch (e) {
      const err = await e;
      toast.error(err?.message || 'Load data message failed!');
    }
  };

  const loadFindMessages = async () => {
    try {
      const resp = await messageService.findConversation(findMessageQuery);
      navigate.push(`/messages/${resp.conversationId}`);
    } catch (e) {
      const err = await e;
      toast.error(err?.message || 'Load data message failed!');
    }
  };

  const onFilter = (values: any) => {
    setQuery({
      ...query,
      userId: values.userId,
      modelId: values.modelId
    });
  };

  const onFindFilter = (userId, modelId) => {
    setFindMessageQuery({
      id1: userId,
      id2: modelId
    });
  };

  React.useEffect(() => {
    loadMessages();
  }, [query]);

  React.useEffect(() => {
    if (findMessageQuery.id1 && findMessageQuery.id2) {
      loadFindMessages();
    }
  }, [findMessageQuery]);

  return (
    <>
      <FormFilter key="form" filter={onFilter} />
      <>
        <Table responsive striped borderless key="table">
          <thead>
            <tr>
              <th>Absender</th>
              <th>
                <a>Text</a>
              </th>
              <th>
                <a>Type</a>
              </th>
              <th>
                <a>Erstellen bei</a>
              </th>
              <th>
                <a>View chat</a>
              </th>
            </tr>
          </thead>
          <tbody>
            {dataMessage && dataMessage.length > 0 ? (
              dataMessage.map((item: any, index:number) => (
                <tr key={index as any} onClick={()=> onFindFilter(item.senderId, item.recipientId)}>
                  <td>{item.sender && item.sender.username}</td>
                  <td><span>{item.text}</span></td>
                  <td>{item.sender && item.sender.type}</td>
                  <td>
                    <Moment format="YYYY-MM-DD">{item.createdAt}</Moment>
                  </td>
                  <td  style={{cursor: 'pointer'}} className=''>
                    View
                    <i style={{marginLeft: '1vw'}} className="fa fa-eye" aria-hidden="true"></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr key="non-message">
                <td>Kein Artikel zum Anzeigen</td>
              </tr>
            )}
          </tbody>
        </Table>
        {totalMessage > 0 && totalMessage > query.take
              && (
                <MainPaginate
                  currentPage={query.page}
                  pageTotal={totalMessage}
                  pageNumber={query.take}
                  setPage={(page) => setQuery({ ...query, page })}
                />
              )}
      </>
    </>
  );
}
export default TableMessages;
