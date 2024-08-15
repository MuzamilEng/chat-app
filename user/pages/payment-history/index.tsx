import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getInvoice } from 'src/redux/payment/actions';
import { withAuth } from 'src/redux/withAuth';

interface IProps {
  items: any;
  total: any;
  getInvoice: Function;
  lang: string; 
}

interface IStates {
  page: number;
  take: number;
  sort: string;
  sortType: string;
  q: string;
}

const PaymentHistory = dynamic(() => import('src/components/payment/payment-history'));
const PageTitle = dynamic(() => import('@components/page-title'));

class PaymentHistoryPage extends Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      page: 1,
      take: 10,
      sort: '',
      sortType: '',
      q: ''
    };
  }

  componentDidMount() {
    this.props.getInvoice(this.state);
  }

  doGetInvoice(newState: any) {
    this.setState(newState as IStates, () => this.props.getInvoice(this.state));
  }

  render() {
    const { items, total, lang } = this.props;
    const { take, q } = this.state;
  
    return (
      <main className="main scroll">
        <Container fluid className="p-3">
          <PageTitle title="Zahlungsverlauf" />
          <Row className="m-2 mgB20">
            <Col md={12} className="mb-4">
              <h4 className="font-weight-semibold">{lang === 'de' ? 'Zahlungsverlauf' : 'Payment History'}</h4>
            </Col>
            <Col md={6} className="mt-2">
            {lang === 'de' ? 'Anzeigen' : 'View'}
              {' '}
              <select
                className="select-pageSize"
                value={take}
                onChange={(e) => this.doGetInvoice({ take: Number(e.target.value) })}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
              {' '}
              {lang === 'de' ? 'Eintraege' : 'Entries'}
            </Col>
            <Col md={6} className="mt-2">
              <div className="search-box">
              {lang === 'de' ? 'Suche' : 'Search'}:
                {' '}
                <input
                  type="text"
                  placeholder={lang === 'de' ? 'Suche' : 'Search'}
                  value={q}
                  onChange={(e) => this.doGetInvoice({ q: e.target.value })}
                />
              </div>
            </Col>
            <Col md={12} className="p-2">
              <PaymentHistory
                invoices={items}
                total={total}
                handleGetInvoice={this.doGetInvoice.bind(this)}
                {...this.state}
              />
            </Col>
          </Row>
        </Container>
      </main>
    );
  }
}

const mapStateToProps = (state: any) => ({ ...state.payment });
const mapDispatch = { getInvoice };

export default withAuth(connect(mapStateToProps, mapDispatch)(PaymentHistoryPage)) as any;
