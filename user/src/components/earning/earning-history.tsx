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
  handleGetEarning: Function;
  // Parent's state
  page: number;
  take: number;
  sort: string;
  sortType: string;
  totalEarnings: number
  // --- end ---
}

const status = {
  approved: 'Approved',
  pending: 'Pending',
  paid: 'Paid',
  requesting: 'Requesting'
};

function EarningHistory({
  items,
  total,
  handleGetEarning,
  page,
  take,
  sort,
  sortType,
  totalEarnings
}: IProps) {
  const {lang} = useTranslationContext();
  const columns = [
    { name:  'Name', value: 'name' },
    { name: 'Token', value: 'token' },
    { name: 'Provision', value: 'commission' },
    { name:  lang === 'en' ? 'Balance' : 'Kontostand', value: 'balance' },
    { name: lang === 'en' ? 'Type' : 'Typ', value: 'type' },
    { name:  lang === 'en' ? 'Status' : 'Status', value: 'status' },
    { name:  lang === 'en' ? 'Created at' : 'Erstellt am', value: 'createdAt' }
  ];

  return (
    <>
      <Table
        id="table-earning-history"
        responsive
        striped
        borderless
        hover
      >
        <TableHeaderBasic columns={columns} handleSort={handleGetEarning} sort={sort} sortType={sortType} />
        <tbody>
          {items && items.length > 0 ? (
            items.map((item) => (
              <tr key={item._id}>
                <td>{item.user?.username || 'N/A'}</td>
                <td>
                  <NumericFormat thousandSeparator value={item.token} displayType="text" decimalScale={2} />
                </td>
                <td>
                  <NumericFormat
                    thousandSeparator
                    value={item.commission}
                    displayType="text"
                    decimalScale={2}
                  />
                </td>
                <td>
                  <NumericFormat thousandSeparator value={item.balance} displayType="text" decimalScale={2} />
                </td>

                <td>
                  {item.type === 'send_message' && 'Message'}
                  {item.type === 'purchase_media' && 'Purchase Media'}
                  {item.type === 'share_love' && 'Tip'}
                </td>
                <td>{status[item.status]}</td>
                <td>
                  <Moment format="HH:mm DD/MM/YYYY">{item.createdAt}</Moment>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>{lang === 'en' ? 'No Earning yet' : 'Kein Token verfügbar'}</td>
            </tr>
          )}
        </tbody>
      </Table>

      <article style={{display: 'flex', justifyContent: 'space-between', padding: '2vw', backgroundColor: '#f5f5f5', boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)'}}>
      <aside style={{width: '45%'}}>
        <div style={{display: 'flex', width: '55%', justifyContent: 'space-evenly',
      alignItems: 'center',}}>
        <span >Model</span>
        <span>Provision</span>
        <span></span>

      </div>

      <main style={{backgroundColor: '#ff337c', color: 'white', width: '100%', borderTopRightRadius: '5vw', borderBottomRightRadius: '5vw',
      display: 'flex', justifyContent: 'space-evenly',
      alignItems: 'center', padding: '1vw'}} className='flex'>
        <p style={{marginLeft: '-1vw'}}>Starter</p>
        <p>20%</p>
        <p>{lang === 'en' ? 'A commission of 20% is charged on every income.' : 'Auf jede Einnahme wird eine Provision von 20% erhoben'}.</p>
      </main>
      </aside>
      <section style={{marginTop: '1vw'}}>
        <span>Gesamteinnahmen</span> <br />
        <span style={{marginLeft: '4vw'}}>{totalEarnings}</span>
      </section>
      </article>
      
      <TableFooterBasic changePage={(value) => handleGetEarning({ page: value.data })} page={page} take={take} total={total} />
    </>

  );
}

export default EarningHistory;
