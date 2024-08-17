import { purchaseItem } from '@redux/purchase-item/actions';
import { mediaService } from '@services/media.service';
import { useTranslationContext } from 'context/TranslationContext';
import { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import ImageBox from 'src/components/conversation/image-box';

interface IProps {
  items: any;
  type: string;
  download?: boolean;
  sender?: {
    type: string;
  }
  messageLength?: number;
}

function MediaContent({ items, type, sender, download = true, messageLength }: IProps) {
  const [activeImage, setActiveImage] = useState('');
  const dispatch = useDispatch();
  const [userType, setUserType] = useState('');
  const [mediaItems, setMediaItems] = useState(items);
  const {lang} = useTranslationContext()

  const handleDownloadFile = async (mediaId: string, item: any) => {
    if((item.sellItemId && item.isPurchased === true) || (item.sellItemId === false)){
      try {
        const resp = await mediaService.download(mediaId);
        const a = document.createElement('a');
        a.href = resp.data.href;
        a.target = '_blank';
        a.click();
      } catch (e) {
        const error = await e;
        toast.error(error?.message || lang === 'en' ? 'File could not be downloaded' : 'Datei konnte nicht heruntergeladen werden!');
      }
    } 
     else{
      toast.error( lang === 'en' ? 'You are not allowed to download this file' : 'Sie sind nicht berechtigt, diese Inhalte zu erwerben.');
    }
  };

  let authUser = {
    type: 'user'
  };

  const handlePurchase = (item: any) => {
    if (authUser.type === 'model') {
      toast.error( lang === 'en' ? 'Only users can purchase premium content.' : 'Es tut uns leid. Nur Benutzer können Premium-Inhalte erwerben.');
    } else if (window.confirm( lang === 'en' ? 'Are you sure you want to buy this item?' : 'Sind Sie sicher, dass Sie dieses Element kaufen möchten?')) {
      dispatch(purchaseItem({ sellItemId: item.sellItemId }))
      const updatedItems = mediaItems.map(mediaItem => {
        if (mediaItem._id === item._id) {
          return { ...mediaItem, isPurchased: true };
        }
        return mediaItem;
      });
      setMediaItems(updatedItems);
    }
  };

  useEffect(()=> {
    const userType = JSON.parse(localStorage.getItem('userType') || '');
    setUserType(userType);
  }, []);


  return (
    <>
      <div className="form-row">
        {mediaItems?.map((item) => (
          <div className="col m-auto" key={item?._id}>
            <a
              aria-hidden
              className="popup-media"
              onClick={() => {
                if (type === 'video') {
                  return;
                }
                setActiveImage(`${item?.fileUrl}`);
              }}
            > 
            {userType === 'model' || item.isFree === true || item.sellItemId === null ? (
              <img alt="media_thumb" src={item?.thumbUrl} />
            ) : 
              <div className={item && item.isPurchased === true && item.isFree === false ? 'image-box mt-3 active' : 'image-box mt-3'}>
                <img 
                  onClick={() => {
                    if (download) {
                      handleDownloadFile(item._id, item);
                    }
                  }} 
                  alt=""  
                  className={`img-fluid rounded`} 
                  src={item && item.isPurchased === true && item.isFree === false ? item?.thumbUrl || '/images/default_thumbnail_photo.jpg' : item.media?.blurUrl || '/images/default_thumbnail_photo.jpg'} 
                />
                <h5>
                  {item && item.isPurchased === true && item.isFree === false ? (
                    <span>
                      <i className="far fa-eye" />
                      {' '}
                      {lang === 'en' ? 'View' : 'Vorschau'}
                    </span>
                  ) : (
                    <span>
                      <NumericFormat thousandSeparator value={item.price} displayType="text" />
                      {' '}
                      Tokens
                    </span>
                  )}
                </h5>
                { <a
                  aria-hidden
                  className="btn btn-primary pointer"
                  onClick={() => handlePurchase(item)}
                >
                  {lang === 'en' ? 'Buy now' : 'Jetzt kaufen'}
                </a>}
                <div className="overlay" />
              </div>
            }
              {/* type = video */}
              {type === 'video' && (
              <video controls src={`${item?.fileUrl}`} width="100%" />
              )}
            </a>
          </div>
        ))}
      </div>

      <ImageBox image={activeImage} />
    </>
  );
}

export default MediaContent;
