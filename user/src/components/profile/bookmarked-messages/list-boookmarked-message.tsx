import Loading from '@components/common-layout/loading/loading';
import TableFooterBasic from '@components/common-layout/table/footer-basic';
import { messageService } from '@services/message.service';
import { useEffect, useState } from 'react';
import {
  Col,
  Tab, Tabs
} from 'react-bootstrap';
import { toast } from 'react-toastify';

import TableBookmarked from './table-bookmarked';
import { useTranslationContext } from 'context/TranslationContext';
// Child Component

function ListBookmarkedMessage() {
  const columns = [
    { name: 'Chatten mit', value: 'chatwith' },
    { name: 'Absender', value: 'send' },
    { name: 'Beschreibung', value: 'description' },
    { name: 'Erstellt am', value: 'createdAt' },
    { name: 'Aktion', value: 'action' }
  ];

  const [listBookmarked, setListBookmarked] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState({
    type: 'text',
    page: 1,
    take: 10,
    sort: '',
    sortType: ''
  });

  const {t, lang} = useTranslationContext();

  const loadBookmarkedMessages = async () => {
    try {
      setLoading(true);
      const resp = await messageService.getListBookmarked(query);
      setListBookmarked(resp.data.items);
      setTotal(resp.data.count);
    } catch (e) {
      const err = await e;
      toast.error(err?.message || 'Das Laden meiner markierten Nachrichten ist fehlgeschlagen!');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmarked = async (bookmarkId: string) => {
    try {
      await messageService.removeBookmarked(bookmarkId);
      toast.success('Entfernen des markierten Nachrichtenerfolgs');
    } catch (err) {
      const error = await err;
      toast.error(error?.message || 'Entfernen der markierten Nachricht fehlgeschlagen!');
    }
  };

  const onChangPage = (value: any) => {
    setQuery({ ...query, ...value });
  };

  const onChangeTab = (type: any) => {
    setQuery({ ...query, page: 1, type });
  };

  useEffect(() => {
    loadBookmarkedMessages();
  }, [query]);

  const renderAlert = () => (
    <p className="text-alert-danger">
      {lang === 'de' ? 'Sie haben keine Nachrichten-Lesezeichen' : "You don't have text message bookmarks "}
    {/* Sie haben keine */}
    {' '}
    {query.type}
    {' '}
    {/* Nachrichten-Lesezeichen */}
  </p>
  );

  return (
    <>
      <Col md={6} className="mt-2">
      {lang === 'de' ? 'Anzeigen' : 'View'}
        {' '}
        <select
          className="select-pageSize"
          value={query.take}
          onChange={(e) => onChangPage({ take: Number(e.target.value) })}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
        {' '}
        {lang === 'de' ? 'Eintraege' : 'Entries'}
      </Col>
      <Col md={12} className="p-2">
        <Tabs defaultActiveKey="text" transition={false} id="tab-media-content" onSelect={(key) => onChangeTab(key)}>
          <Tab eventKey="text" title="Text">
            {loading && <Loading />}
            {!loading && listBookmarked && listBookmarked.length > 0
              && (
              <TableBookmarked
                columns={columns}
                sort={query.sort}
                sortType={query.sortType}
                listBookmarked={listBookmarked}
                onChangPage={onChangPage}
                removeBookmarked={removeBookmarked}
              />
              )}
            {!loading && listBookmarked && listBookmarked.length === 0 && renderAlert()}
            <TableFooterBasic
              take={query.take}
              total={total}
              page={query.page}
              changePage={(value) => onChangPage({ page: value.data })}
            />
          </Tab>
          <Tab eventKey="photo" title={lang === 'en' ? 'Photos' : 'Fotos'}>
            {loading && <Loading />}
            {!loading && listBookmarked && listBookmarked.length > 0
              && (
              <TableBookmarked
                columns={columns}
                sort={query.sort}
                sortType={query.sortType}
                listBookmarked={listBookmarked}
                onChangPage={onChangPage}
                removeBookmarked={removeBookmarked}
              />
              )}
            {!loading && listBookmarked && listBookmarked.length === 0 && renderAlert()}
            <TableFooterBasic
              take={query.take}
              total={total}
              page={query.page}
              changePage={(value) => onChangPage({ page: value.data })}
            />
          </Tab>
          <Tab eventKey="video" title="Video">
            {loading && <Loading />}
            {!loading && listBookmarked && listBookmarked.length > 0
              && (
              <TableBookmarked
                columns={columns}
                sort={query.sort}
                sortType={query.sortType}
                listBookmarked={listBookmarked}
                onChangPage={onChangPage}
                removeBookmarked={removeBookmarked}
              />
              )}
            {!loading && listBookmarked && listBookmarked.length === 0 && renderAlert()}
            <TableFooterBasic
              take={query.take}
              total={total}
              page={query.page}
              changePage={(value) => onChangPage({ page: value.data })}
            />
          </Tab>
          <Tab eventKey="file" title={lang === 'de' ? 'Dokument' : 'Document'}>
            {loading && <Loading />}
            {!loading && listBookmarked && listBookmarked.length > 0
              && (
              <TableBookmarked
                columns={columns}
                sort={query.sort}
                sortType={query.sortType}
                listBookmarked={listBookmarked}
                onChangPage={onChangPage}
                removeBookmarked={removeBookmarked}
              />
              )}
            {!loading && listBookmarked && listBookmarked.length === 0 && renderAlert()}
            <TableFooterBasic
              take={query.take}
              total={total}
              page={query.page}
              changePage={(value) => onChangPage({ page: value.data })}
            />
          </Tab>
        </Tabs>
      </Col>
    </>
  );
}

export default ListBookmarkedMessage;
