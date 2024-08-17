import Loading from '@components/common-layout/loading/loading';
import { purchaseItemService } from '@services/purchase-item.service';
import { useTranslationContext } from 'context/TranslationContext';
import { useEffect, useState } from 'react';
import {
  Col, Row, Tab, Tabs
} from 'react-bootstrap';
import { toast } from 'react-toastify';
// Child Component
import MainPaginate from 'src/components/paginate/main-paginate';

interface IProps {
  openMedia: Function;
}
function ListPurchasedItems({
  openMedia
}: IProps) {
  const [itemsPhoto, setItemsPhoto] = useState([] as any);
  const [totalPhoto, setTotalPhoto] = useState(0);
  const [pagePhoto, setPagePhoto] = useState(1);
  const [itemsVideo, setItemsVideo] = useState([] as any);
  const [totalVideo, setTotalVideo] = useState(0);
  const [pageVideo, setPageVideo] = useState(1);
  const [loading, setLoading] = useState(false);
  const take = 9;
 const {lang} = useTranslationContext()
  const getPurchasedItemPhoto = async () => {
    try {
      setLoading(true);
      const resp = await purchaseItemService.getPurchaseItem({ page: pagePhoto, type: 'photo', take });
      setItemsPhoto(resp.data.items);
      setTotalPhoto(resp.data.count);
    } catch (e) {
      const err = await e;
      toast.error(err?.message || lang === 'en' ? 'Failed to load purchased item photos' : 'Das Laden meines gekauften Artikel-Fotos ist fehlgeschlagen!');
    } finally {
      setLoading(false);
    }
  };

  const getPurchasedItemVideo = async () => {
    try {
      setLoading(true);
      const resp = await purchaseItemService.getPurchaseItem({ page: pageVideo, type: 'video', take });
      setItemsVideo(resp.data.items);
      setTotalVideo(resp.data.count);
    } catch (e) {
      const err = await e;
      toast.error(err?.message || lang === 'en' ? 'Failed to load purchased item videos' : 'Das Laden meines gekauften Artikelvideos ist fehlgeschlagen!');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (e, item: any) => {
    e.preventDefault();
    openMedia(item);
  };

  const deletePurchasedItem = async (itemId: string, key: string) => {
    if (!window.confirm( key === 'photo' ? 'Möchten Sie dieses Foto löschen?' : 'Möchten Sie diesen Artikel löschen?')) return;
    if (key === 'photo') {
      try {
        await purchaseItemService.deleteItem(itemId);
        getPurchasedItemPhoto();
        toast.success( lang === 'en' ? 'Photo deleted successfully' : 'Artikelfoto erfolgreich entfernt.');
      } catch (e) {
        const error = await e;
        toast.success(error?.message || lang === 'en' ? 'Failed to delete photo' : 'Entfernen des Artikelfotos fehlgeschlagen.');
      }
    }
    if (key === 'video') {
      try {
        await purchaseItemService.deleteItem(itemId);
        toast.success( lang === 'en' ? 'Video deleted successfully' : 'Artikelvideo erfolgreich entfernt.');
        getPurchasedItemVideo();
      } catch (e) {
        const error = await e;
        toast.success(error?.message || lang === 'en' ? 'Failed to delete video' : 'Entfernen des Artikelvideos fehlgeschlagen.');
      }
    }
  };
  const onChangeTab = (key) => {
    if (key === 'photo') {
      setPagePhoto(1);
    }
    if (key === 'video') {
      setPageVideo(1);
    }
  };

  useEffect(() => {
    getPurchasedItemPhoto();
  }, [pagePhoto]);

  useEffect(() => {
    getPurchasedItemVideo();
  }, [pageVideo]);

  return (
    <div className="card mb-3">
      {/* <div className="card-header">
        <h6 className="mb-1">Purchased Items</h6>
        <p className="mb-0 text-muted small">View your purchased photos & videos</p>
      </div> */}
      <div className="card-body">
        <Tabs defaultActiveKey="photo" transition={false} id="tab-purchased-item" onSelect={(key) => onChangeTab(key)}>
          <Tab eventKey="photo" title={`Fotos (${totalPhoto})`}>
            {loading && <Loading />}
            {!loading && itemsPhoto.length > 0
              ? (
                <Row>
                  {itemsPhoto.map((item: any) => (
                    <Col xs={6} sm={4} md={4} key={item._id} data-toggle="tooltip" title={item.name}>
                      <div className="image-box mt-1 mb-1 active">
                        <img alt="" src={item?.media?.thumbUrl || '/images/default_thumbnail_photo.jpg'} style={{ height: '100%' }} />
                        <h5>
                          <a href="#" className="popup preview-delete" role="button" onClick={(e) => handleView(e, item)}>
                            <i className="far fa-eye" />
                            {' '}
                            {lang === 'en' ? 'View' : 'Vorschau'}
                          </a>
                        </h5>
                        <h5>
                          <a href="#" className="popup preview-delete" role="button" onClick={() => deletePurchasedItem(item._id, 'photo')}>
                            <i className="far fa-trash-alt icon-delete-purchased-item" />
                            {' '}
                            {lang === 'en' ? 'Delete' : 'Löschen'}
                          </a>
                        </h5>
                        <div className="overlay" />
                      </div>
                      {/* <div className="media-name">
                        {item?.name}
                      </div> */}
                    </Col>
                  ))}
                </Row>
              ) : (<p className="text-alert-danger">{lang === 'en' ? 'No photos found' : 'Sie haben kein Foto des gekauften Artikels verfügbar!'}</p>)}
            {itemsPhoto.length > 0 && totalPhoto > 0 && totalPhoto > take && <MainPaginate currentPage={pagePhoto} pageTotal={totalPhoto} pageNumber={take} setPage={setPagePhoto} />}
          </Tab>
          <Tab eventKey="video" title={`Films (${totalVideo})`}>
            {loading && <Loading />}
            {!loading && itemsVideo.length > 0
              ? (
                <Row>
                  {itemsVideo.map((item) => (
                    <Col xs={6} sm={4} md={4} key={item._id} data-toggle="tooltip" title={item.name}>
                      <div className="image-box mt-1 mb-1 pt-100 active">
                        <img alt="" src={item?.media?.thumbUrl || '/images/default_thumbnail_video.png'} className="thumb-video" />
                        <a href="#" className="popup flex" role="button" onClick={(e) => handleView(e, item)}>
                          <span className="flex w-100 mb-2">
                            <i className="icon-play-media flex mx-auto my-auto" />
                          </span>
                        </a>
                        <h5 className="mt-4">
                          <a href="#" className="popup preview-delete" role="button" onClick={(e) => handleView(e, item)}>
                            <i className="far fa-eye" />
                            {' '}
                            {lang === 'en' ? 'View' : 'Vorschau'}
                          </a>
                        </h5>
                        <a className="edit" onClick={() => deletePurchasedItem(item._id, 'video')}>
                          <i className="fas fa-trash" />
                        </a>
                        <div className="overlay" />
                      </div>
                      <div className="media-name">
                        {item.name}
                      </div>
                    </Col>
                  ))}
                  {itemsVideo.length > 0 && totalVideo > 0 && totalVideo > take && <MainPaginate currentPage={pageVideo} pageTotal={totalVideo} pageNumber={take} setPage={setPageVideo} />}
                </Row>
              ) : (<p className="text-alert-danger">{lang === 'en' ? 'No videos found' : 'Sie haben keine Video-Lesezeichen verfügbar!'}</p>)}
            {itemsVideo.length > 0 && totalVideo > 0 && totalVideo > take && <MainPaginate currentPage={pageVideo} pageTotal={totalVideo} pageNumber={take} setPage={setPageVideo} />}
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default ListPurchasedItems;
