import * as React from 'react';
import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import Router, { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-toastify';
import Loading from '@components/loading/loading';
import SellItemDetail from '@components/sell-item/form';
import { sellItemService } from '@services/sell-item.service';

function SellItem() {
  const [loadingSellItem, setLoadingSellItem] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [sellItem, setSellItem] = useState(null);
  const [type, setType] = useState('photo');

  const router = useRouter();
  const sellItemId = router.query.id;

  const findSellItem = async () => {
    setLoadingSellItem(true);
    try {
      const resp = await sellItemService.findOne(sellItemId as string);
      setSellItem(resp.data);
      setType(resp.data.media.type);
    } catch (e) {
      const error = await e;
      toast.error(error?.messsage || 'Fehler, Verkaufsartikel wurde nicht gefunden');
      Router.push('/sell-items/listing?type=photo');
    } finally {
      setLoadingSellItem(false);
    }
  };

  const updateSellItem = async (data: any) => {
    setLoadingUpdate(true);
    const {
      name, price, free, isApproved, description, category
    } = data;
    try {
      await sellItemService.update(sellItemId as string, {
        name, price, free, isApproved, description, category
      });
      toast.success('Artikel wurde aktualisiert');
      type === 'photo' && Router.push('/sell-items/listing?type=photo');
      type === 'video' && Router.push('/sell-items/listing?type=video');
    } catch (e) {
      const error = await e;
      toast.error(error?.messaga || 'Das Aktualisieren des Profilbenutzers ist fehlgeschlagen');
    } finally {
      setLoadingUpdate(false);
    }
  };

  useEffect(() => {
    findSellItem();
  }, []);

  return (
    <main className="main">
      <Head>
        <title>Artikeldetails verkaufen</title>
      </Head>
      <h4 className="title-table">
      Artikeldetails verkaufen
      </h4>
      <Container fluid className="content">
        {loadingSellItem && <Loading />}
        {!loadingSellItem && sellItem && (
        <SellItemDetail
          submit={updateSellItem.bind(this)}
          data={sellItem}
          loadingUpdate={loadingUpdate}
        />
        ) }
      </Container>
    </main>
  );
}

export default SellItem;
