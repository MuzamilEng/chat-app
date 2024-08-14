import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

const PageTitle = dynamic(() => import('@components/page-title'));
const ViewMediaItem = dynamic(() => import('@components/media/view-media-item'));
const MediaContent = dynamic(() => import('@components/profile/media/media-content'));

interface IProps {
  authUser: any;
}
function MediaContentPage({ authUser }: IProps) {
  const [isOpenMedia, setIsOpenMedia] = useState(false);
  const [mediaItem, setMediaItem] = useState(null);
  const [titleModal, setTitleModal] = useState('');
  const [folderImages, setFolderImages] = useState([]);
  const {t, lang} = useTranslationContext()

  const openMedia = (item: any) => {
    setIsOpenMedia(true);
    setMediaItem(item.media);
    setTitleModal(item.name);
  };

  const closeModal = () => {
    setIsOpenMedia(false);
    setMediaItem(null);
    setTitleModal('');
  };

  return (
    <main className="main scroll">
      <PageTitle title="Medieninhalt" />
      <div className="chats">
        <div className="chat-body p-3">
          <div className="row m-0 mb-4">
            <div className="col-md-12">
              <h4 className="font-weight-semibold">{lang === 'en' ? "Media Content" : "Medieninhalt"}</h4>
            </div>
          </div>
          <Row>
          <Col md={12} className="flex justify-content-end mb-2">
              <Button onClick={() => Router.push('/profile/upload', `/${lang}/profile/upload`, { shallow: true })} className="btn btn-primary">
              {lang === 'en' ? "Upload Media" : "Medien hochladen"}
              </Button>
            </Col>
            <Col md={12}>
              {authUser?.type === 'model' && <MediaContent openMedia={openMedia.bind(this)} />}
              {mediaItem && isOpenMedia ? (
                <ViewMediaItem
                  titleModal={titleModal}
                  mediaItem={mediaItem}
                  isOpenMedia={isOpenMedia}
                  closeMedia={closeModal.bind(this)}
                />
              ) : null}
            </Col>
          </Row>
        </div>
      </div>
    </main>
  );
}

const mapStateToProps = (state: any) => ({
  authUser: state.auth.authUser
});

export default connect(mapStateToProps)(MediaContentPage);
