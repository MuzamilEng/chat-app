import { authService } from '@services/auth.service';
import { sellItemService } from '@services/sell-item.service';
import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

interface IProps {
  mediaItem: any;
  isOpenMedia: boolean;
  closeMedia: Function;
  titleModal?: string;
}
function ViewMediaItem({
  mediaItem, isOpenMedia, closeMedia, titleModal = ''
}: IProps) {
  const [mediaUrl, setMediaUrl] = useState(mediaItem?.fileUrl || '');
  const [isLiked, setIsLiked] = useState(false); // Track if the media is liked
  const authUser = useSelector((state: any) => state.auth.authUser);

  const onLikesSubmit = async () => {
    try {
      await sellItemService.updateLikes({ mediaId: mediaItem._id, userId: authUser?._id });
      setIsLiked(!isLiked); // Toggle the liked state
      if (!isLiked) {
        toast.success('You liked the video!');
      } else {
        toast.info('You unliked the video!');
      }
    } catch (e) {
      toast.error('Something went wrong!');
    }   
  };

  useEffect(() => {
    if (mediaItem?.fileUrl) {
      const url = new URL(mediaItem?.fileUrl);
      if (authUser && mediaItem?.fileUrl.indexOf('userId=') === -1) url.searchParams.append('userId', authUser._id);
      if (mediaItem?.fileUrl.indexOf('mediaId=') === -1) url.searchParams.append('mediaId', mediaItem?._id);
      if (mediaItem?.fileUrl.indexOf('access_token=') === -1) url.searchParams.append('access_token', authService.getToken());
      setMediaUrl(url.href);
    }
  }, [mediaItem]);

  return (
    <Modal
      dialogClassName="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom mw-80"
      aria-labelledby="contained-modal-title-vcenter"
      className="modal modal-lg-fullscreen fade modal-uploader model-content-image"
      show={isOpenMedia}
      onHide={() => closeMedia()}
    >
      <Modal.Header>
        <Modal.Title className="text-align-start media-name" data-toggle="tooltip" title={titleModal || 'View media'}>{titleModal || 'View media'}</Modal.Title>
        <Button className="fa fa-xmark" type="button" aria-label="Close" onClick={() => closeMedia()} />
      </Modal.Header>
      <Modal.Body style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} className="flex my-0 mx-auto">
        <div className="content-view-detail">
          {mediaItem?.type === 'photo' ? (
            <img alt="" src={mediaUrl} className="w-100 h-auto" />
          ) : (
            <video controls autoPlay src={mediaUrl} className="w-100 h-100" />
          )}
        </div>
        <i 
          style={{ 
            cursor: 'pointer', 
            marginLeft: '2vw', 
            marginTop: '2vw', 
            fontSize: '2vw', 
            color: isLiked ? 'pink' : 'black' // Dynamically set the heart color
          }} 
          className="fas fa-heart" 
          onClick={onLikesSubmit} 
        />
      </Modal.Body>
    </Modal>
  );
}

export default ViewMediaItem;
