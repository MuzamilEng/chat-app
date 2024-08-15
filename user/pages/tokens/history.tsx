import PageTitle from '@components/page-title';
import { earningService } from '@services/earning.service';
import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';

const TokenHistory = dynamic(() => import('src/components/token/token-history'));

const initialQuery = {
  page: 1,
  take: 10,
  sort: '',
  sortType: '',
  q: ''
} as any;

function TokenHistoryPage() {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState({} as any);
  const [total, setTotal] = useState(0);
  const {t, lang} = useTranslationContext()

  const loadEarning = async () => {
    try {
      const resp = await earningService.find(query);
      setItems(resp.data.items);
      setTotal(resp.data.count);
    } catch (e) {
      const error = await e;
      toast.error(error?.message || 'Das Laden der Verdienstdaten ist fehlgeschlagen!');
    }
  };

  const handleGetTransaction = (newquery: any) => {
    newquery;
    setQuery({ ...query, ...newquery });
  };

  useEffect(() => {
    loadEarning();
  }, [query]);

  return (
    <main className="main scroll">
      <Container fluid className="p-3">
        <PageTitle title={t?.tokenPage?.title} />
        <Row className="m-0 mgB20 flex">
          <Col md={12} className="mb-4">
            <h4 className="font-weight-semibold">{t?.tokenPage?.title}</h4>
          </Col>
          <Col md={6} className="mt-2">
          {lang === 'de' ? 'Anzeigen' : 'View'}
          {' '}
            <select
              className="select-pageSize"
              value={query.take}
              onChange={(e) => handleGetTransaction({ take: Number(e.target.value) })}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            {' '}
            {lang === 'de' ? 'Einträge' : 'Entries'}
          </Col>
          <Col md={6} className="flex justify-content-end align-items-center mt-2">
            <div className="search-box">
            Modell:
              {' '}
              <input
                type="text"
                placeholder={lang === 'de' ? 'Modell suchen' : 'Search model'}
                value={query.q}
                onChange={(e) => handleGetTransaction({ q: e.target.value })}
              />
            </div>
          </Col>
          <Col md={12} className="p-2">
            <TokenHistory
              items={items}
              total={total}
              handleGetTransaction={handleGetTransaction.bind(this)}
              {...query}
            />
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default TokenHistoryPage;
