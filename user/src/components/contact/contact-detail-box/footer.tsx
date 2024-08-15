import { sellItemService } from '@services/sell-item.service';
import { useEffect, useState } from 'react';
import {
  Col, Row, Tab, Tabs
} from 'react-bootstrap';
import { NumericFormat } from 'react-number-format';
import { connect, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from 'src/components/common-layout/loader/loader';
// Child Component
import ViewMediaItem from 'src/components/media/view-media-item';
import MainPaginate from 'src/components/paginate/main-paginate';
// Actions
import { purchaseItem } from 'src/redux/purchase-item/actions';
import { getSellItem } from 'src/redux/sell-item/actions';

interface IProps {
  authUser?: any;
  items?: any; // media list
  total?: number;
  contact: any;
  isFriend: boolean;
  getSellItemStore?: {
    requesting: boolean;
    success: boolean;
    error: any;
  };
}
function ContactFooter({
  authUser = null,
  items = null,
  total = 0,
  contact,
  isFriend,
  getSellItemStore = {
    requesting: false,
    success: false,
    error: null
  }
}: IProps) {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('video');
  const [isOpenMedia, setIsOpenMedia] = useState(false);
  const [mediaItem, setMediaItem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [titleModal, setTitleModal] = useState('');
  const [photoFolders, setPhotoFolders] = useState([]);
  const [videoFolders, setVideoFolders] = useState([]);
  const take = 8;
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId === selectedFolderId ? null : folderId);
  };

  const dispatch = useDispatch();

  const gettSellItemRequesting = () => {
    setIsLoading(getSellItemStore.requesting);
  };

  const loadSellItems = () => {
    if (contact && contact._id) {
      dispatch(getSellItem({
        page, mediaType: type, modelId: contact._id, take
      }));
    }
  };

  const fetchData  = async ()=> {
    const resp2 = await sellItemService.getModelSellItems({ page: 1, mediaType: 'photo', take: 9, modelId: contact?._id });
    setPhotoFolders(resp2?.data?.folders);
  }
  const fetchVideoData  = async ()=> {
    const resp2 = await sellItemService.getModelSellItems({ page: 1, mediaType: 'video', take: 9, modelId: contact?._id });
    setVideoFolders(resp2?.data?.folders);
  }

  useEffect(() => {
    gettSellItemRequesting();
    fetchData()
    fetchVideoData()
  }, [getSellItemStore.requesting]);

  useEffect(() => {
    loadSellItems();
  }, [page, contact?._id]);

  useEffect(() => {
    setPage(1);
    loadSellItems();
  }, [type]);

  const handlePurchase = (item: any) => {
    if (authUser.type === 'model') {
      toast.error('Es tut uns leid. Nur Benutzer können Premium-Inhalte erwerben.');
    } else if (window.confirm('Sind Sie sicher, dass Sie dieses Element kaufen möchten?')) {
      dispatch(purchaseItem({ sellItemId: item._id }));
      loadSellItems();
    }
  };
  const handleView = async (e, item: any) => {
    e.preventDefault();
    if (!item.isPurchased && !item.free) return;
    await setMediaItem(item.media);
    setTitleModal(item?.name);
    setIsOpenMedia(true);
  };

  return (
    <div className="tab-box">
      <Tabs defaultActiveKey="photo" transition={false} id="tab-sell-item" onSelect={(key: any) => setType(key)}>
      <Tab eventKey="photo" title="Fotos">
  {isLoading && <Loader />}
  {!isLoading && items && items.length > 0 && (
    <Row>
      {photoFolders?.filter(folder => folder.sellItems.length > 0).map((folder, index) => (
        <Row className="min-h" key={index}>
          <Col xs={12}>
            <section
              onClick={() => handleFolderClick(folder._id)}
              style={{ cursor: 'pointer', margin: '10px', border: selectedFolderId === folder._id ? '' : '1px solid #eee', display: selectedFolderId && selectedFolderId !== folder._id ? 'none' : 'block' }}
              className='image-box mt-1 mb-1 active'
            >
              <img
                style={{ display: selectedFolderId === folder._id ? 'none' : 'block', objectFit: 'cover', width: '100%', height: '13vw' }}
                src={folder?.sellItems?.[0]?.media?.thumbUrl || '/images/default_thumbnail_photo.jpg'}
                alt="media_thumb_photo"
              />
              <button
                style={{ width: '100%', height: '100%', maxWidth: '20vw', backgroundColor: '#FF337C', color: 'white', border: 'none', padding: '10px' }}
                className=''
              >
                {selectedFolderId === folder._id ? "Go back" : folder.name}
              </button>
            </section>
          </Col>
          {selectedFolderId === folder._id && (
            folder.sellItems.length > 0 ? (
              folder.sellItems.map((item, indx) => (
                <article key={folder._id + indx} style={{ width: selectedFolderId === folder._id ? '50vw' : '30%' }}>
                  <Col xs={6} sm={3} md={3} lg={4} className="responsive-width" key={item._id}>
                    <div className={item.isPurchased || item.free ? 'image-box mt-3 active' : 'image-box mt-3'}>
                      <img
                        alt=""
                        src={item.isPurchased || item.free ? item.media?.thumbUrl || '/images/default_thumbnail_photo.jpg' : item.media?.blurUrl || '/images/default_thumbnail_photo.jpg'}
                      />
                      <h5>
                        {item.isPurchased || item.free ? (
                          <span>
                            <i className="far fa-eye" />
                            {' '}
                            Vorschau
                          </span>
                        ) : (
                          <span>
                            <NumericFormat thousandSeparator value={item.price} displayType="text" />
                            {' '}
                            Tokens
                          </span>
                        )}
                      </h5>
                      <a
                        aria-hidden
                        className="btn btn-primary pointer"
                        onClick={() => (isFriend ? handlePurchase(item) : toast.error('Bitte fügen Sie das Modell zu Ihren Favoriten hinzu, um den Artikel zu kaufen.'))}
                      >
                        Jetzt kaufen
                      </a>
                      <a
                        aria-hidden
                        className="popup"
                        role="button"
                        onClick={(e) => handleView(e, item)}
                        style={{ cursor: `${item.isPurchased || item.free ? 'pointer' : 'unset'}` } as any}
                      >
                        {}
                      </a>
                      <div className="overlay" />
                    </div>
                  </Col>
                </article>
              ))
            ) : (
              <Col>
                <p className="text-alert-danger">Sie haben kein Foto verfügbar!</p>
              </Col>
            )
          )}
        </Row>
      ))}
    </Row>
  )}
</Tab>

        <Tab eventKey="videos" title={`Videos`}>
  {isLoading && <Loader />}
  {!isLoading && videoFolders.length > 0 && (
    <Row>
    {videoFolders?.filter(folder => folder.sellItems.length > 0).map((folder, index) => (
      <Row className="min-h" key={index}>
        <Col xs={12}>
          <section
            onClick={() => handleFolderClick(folder._id)}
            style={{ cursor: 'pointer', width: '100%', maxWidth: '10vw', margin: '10px', border: selectedFolderId === folder._id ? '' : '1px solid #eee', display: selectedFolderId && selectedFolderId !== folder._id ? 'none' : 'block' }}
            className='image-box mt-1 mb-1 active'
          >
            <video
              style={{ display: selectedFolderId === folder._id ? 'none' : 'block', objectFit: 'cover', width: '100%', height: '13vw' }}
              src={folder?.sellItems?.[0]?.media?.fileUrl || '/images/default_thumbnail_video.png'}
            />
            <button
              style={{ width: '100%', height: '100%', maxWidth: '20vw', backgroundColor: '#FF337C', color: 'white', border: 'none', padding: '10px' }}
              className=''
            >
              {selectedFolderId === folder._id ? "Go back" : folder.name}
            </button>
          </section>
        </Col>
        {selectedFolderId === folder._id && (
          folder.sellItems.length > 0 ? (
            folder.sellItems.map((item, indx) => (
              <article key={folder._id + indx} style={{ width: selectedFolderId === folder._id ? '50vw' : '30%' }}>
                <Col xs={6} sm={3} md={3} lg={4} className="responsive-width" key={item._id}>
                  <div className={item.isPurchased || item.free ? 'image-box mt-3 active' : 'image-box mt-3'}>
                    <video
                      controls style={{ objectFit: 'cover', width: '100%', height: '13vw' }}
                      src={item.isPurchased || item.free ? item.media?.fileUrl || '/images/default_thumbnail_video.png' : item.media?.blurUrl || '/images/default_thumbnail_video.png'}
                    />
                    <h5>
                      {item.isPurchased || item.free ? (
                        <span>
                          <i className="far fa-eye" />
                          {' '}
                          Vorschau
                        </span>
                      ) : (
                        <span>
                          <NumericFormat thousandSeparator value={item.price} displayType="text" />
                          {' '}
                          Tokens
                        </span>
                      )}
                    </h5>
                    <a
                      aria-hidden
                      className="btn btn-primary pointer"
                      onClick={() => (isFriend ? handlePurchase(item) : toast.error('Bitte fügen Sie das Modell zu Ihren Favoriten hinzu, um den Artikel zu kaufen.'))}
                    >
                      Jetzt kaufen
                    </a>
                    <a
                      aria-hidden
                      className="popup"
                      role="button"
                      onClick={(e) => handleView(e, item)}
                      style={{ cursor: `${item.isPurchased || item.free ? 'pointer' : 'unset'}` } as any}
                    >
                      <div className="flex justify-content-center">
                        <i className={`icon-play ${item.isPurchased || item.free ? 'purchased-free ' : ''}`} />
                      </div>
                    </a>
                    <div className="overlay" />
                  </div>
                </Col>
              </article>
            ))
          ) : (
            <Col>
              <p className="text-alert-danger">Sie haben kein Video verfügbar!</p>
            </Col>
          )
        )}
      </Row>
    ))}
  </Row>
  
  )}
</Tab>

      </Tabs>
      {!isLoading && (!items || (items && items.length === 0)) && (
        <p className="text-alert-danger">
          nein
          {' '}
          {type}
          s
          {' '}
          sind verfügbar!
        </p>
      )}
      {total > 0 && total > take ? <MainPaginate currentPage={page} pageTotal={photoFolders.length} pageNumber={take} setPage={setPage} /> : null}
      <ViewMediaItem
        titleModal={titleModal}
        mediaItem={mediaItem}
        isOpenMedia={isOpenMedia}
        closeMedia={setIsOpenMedia.bind(this)}
      />
    </div>
  );
}

const mapStateToProps = (state: any) => ({ ...state.sellItem, authUser: state.auth.authUser });

export default connect(mapStateToProps)(ContactFooter);
