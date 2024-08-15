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
  handleGetTransaction: Function;
  // Parent's state
  page: number;
  take: number;
  sort: string;
  sortType: string;
  // --- end ---
}

// const status = {
//   approved: 'Approved',
//   pending: 'Pending',
//   paid: 'Paid',
//   requesting: 'Requesting'
// };

function TokenHistory({
  items,
  total,
  handleGetTransaction,
  page,
  take,
  sort,
  sortType
}: IProps) {

  const {t, lang} = useTranslationContext();
  const columns = [
    { name: lang === 'de' ? 'Modellname' : 'Model Name', value: 'name' },
    { name: 'Token', value: 'token' },
    { name: 'Typ', value: 'type' },
    // { name: 'Status', value: 'status' },
    { name: lang === 'en' ? 'Transaction timestamp' : 'Transaktionszeitstempel', value: 'createdAt' }
  ];

  return (
    <>
      <Table
        id="table-token-history"
        responsive
        striped
        borderless
        hover
      >
        <TableHeaderBasic columns={columns} handleSort={handleGetTransaction} sort={sort} sortType={sortType} />
        <tbody>
          {items && items.length > 0 ? (
            items.map((item) => (
              <tr key={item._id}>
                <td>{item.model.username}</td>
                <td>
                  <NumericFormat thousandSeparator value={item.token} displayType="text" decimalScale={2} />
                </td>
                <td>
                  {item.type === 'send_message' && 'Message'}
                  {item.type === 'purchase_media' && 'Purchase Media'}
                  {item.type === 'share_love' && 'Tip'}
                </td>
                {/* <td>{status[item.status]}</td> */}
                <td>
                  <Moment format="HH:mm DD/MM/YYYY">{item.createdAt}</Moment>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>Kein Token verfügbar</td>
            </tr>
          )}
        </tbody>
      </Table>
      <TableFooterBasic changePage={(value) => handleGetTransaction({ page: value.data })} page={page} take={take} total={total} />
    </>
  );
}

export default TokenHistory;
