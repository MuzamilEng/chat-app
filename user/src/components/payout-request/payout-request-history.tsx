import { useTranslationContext } from 'context/TranslationContext';
import { Table } from 'react-bootstrap';
import Moment from 'react-moment';
import { NumericFormat } from 'react-number-format';
import TableFooterBasic from 'src/components/common-layout/table/footer-basic';
// Child component
import TableHeaderBasic from 'src/components/common-layout/table/header-basic';

interface IProps {
  items: any;
  total: any;
  handleGetPayoutRequest: Function;
  // Parent's state
  page: number;
  take: number;
  sort: string;
  sortType: string;
  // --- end ---
}

const status = {
  approved: 'Approved',
  pending: 'Pending',
  paid: 'Paid',
  rejected: 'Rejected'
};

function PayoutRequestHistory({
  items,
  total,
  handleGetPayoutRequest,
  page,
  take,
  sort,
  sortType
}:IProps) {
  const {t, lang} = useTranslationContext();
  const columns = [
    { name: 'Name', value: 'name' },
    { name: lang === 'en' ? 'Amount' : 'Summe', value: 'tokenRequest' },
    { name: lang === 'en' ? 'Payout type' : 'Kontotyp', value: '' },
    { name: lang === 'en' ? 'Status' : 'Status', value: 'status' },
    { name: lang === 'en' ? 'Created at' : 'Erstellt am', value: 'createdAt' }
  ];

  return (
    <>
      <Table
        id="table-earning"
        responsive
        striped
        borderless
        hover
      >
        <TableHeaderBasic columns={columns} handleSort={handleGetPayoutRequest} sort={sort} sortType={sortType} />
        <tbody>
          {items && items.length > 0 ? (
            items.map((item) => (
              <tr key={item._id}>
                <td>{item.model?.username}</td>
                <td>
                  <NumericFormat thousandSeparator value={item?.tokenRequest} displayType="text" decimalScale={2} />
                </td>
                <td>
                  {item?.payoutAccount?.type === 'bank' && 'Wire Transfer'}
                  {item?.payoutAccount?.type === 'paypal' && 'Paypal'}
                  {item?.payoutAccount?.type === 'paxum' && 'Paxum'}
                </td>

                <td>{status[item.status]}</td>
                <td>
                  <Moment format="HH:mm DD/MM/YYYY">{item.createdAt}</Moment>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>{lang === 'en' ? 'No payout request available' : 'Keine Auszahlungsanfrage verfügbar'}</td>
            </tr>
          )}
        </tbody>
      </Table>
      <TableFooterBasic changePage={handleGetPayoutRequest} page={page} take={take} total={total} />
    </>
  );
}

export default PayoutRequestHistory;
