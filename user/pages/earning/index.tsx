import PageTitle from '@components/page-title';
import { earningService } from '@services/earning.service';
import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
// Child component
const EarningHistory = dynamic(() => import('src/components/earning/earning-history'));

const initialQuery = {
  page: 1,
  take: 10,
  sort: '',
  sortType: '',
  q: ''
} as any;

function EarningHistoryPage() {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState({} as any);
  const [total, setTotal] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const {t, lang} = useTranslationContext()

  const loadEarning = async () => {
    try {
      const resp = await earningService.find(query);
      setItems(resp.data.items);
      setTotalEarnings(resp.data.totalEarnings);
      setTotal(resp.data.count);
    } catch (e) {
      const error = await e;
      toast.error(error?.message || 'Das Laden der Daten zum Verdienen ist fehlgeschlagen!');
    }
  };

  const handleGetEarning = (newquery: any) => {
    setQuery({ ...query, ...newquery });
  };

  useEffect(() => {
    loadEarning();
  }, [query]);
  return (
    <main className="main scroll">
      <Container fluid className="p-3">
        <PageTitle title={lang === 'en' ? "Earnings" : "Verdienst"} />
        <Row className="m-2 mgB20">
          <Col md={12} className="mb-4">
            <h4 className="font-weight-semibold">{lang === 'en' ? "Earnings" : "Verdienst"}</h4>
          </Col>
          <Col md={6} className="mt-2">
          {lang === 'de' ? 'Anzeigen' : 'View'}
            {' '}
            <select
              className="select-pageSize"
              value={query.take}
              onChange={(e) => handleGetEarning({ take: Number(e.target.value) })}
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
            {lang === 'de' ? 'Nutzer' : 'Search'}:
              {' '}
              <input
                className="ml-1"
                type="text"
                placeholder={lang === 'de' ? 'Nutzer suchen' : 'Search user'}
                value={query.q}
                onChange={(e) => handleGetEarning({ q: e.target.value })}
              />
            </div>
          </Col>
          <Col md={12} className="p-2">
            <EarningHistory
              items={items}
              total={total}
              totalEarnings={totalEarnings}
              handleGetEarning={handleGetEarning.bind(this)}
              {...query}
            />
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default EarningHistoryPage;
