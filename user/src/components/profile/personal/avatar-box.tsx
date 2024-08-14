import getConfig from 'next/config';
import { useState } from 'react';
import { toast } from 'react-toastify';
import ModalUpload from 'src/components/upload/ModalUpload';

interface IProps {
  avatarUrl: string;
  onUploadAvatarComplete: any;
}

function AvatarComponent({ avatarUrl, onUploadAvatarComplete }: IProps) {
  const { publicRuntimeConfig: config } = getConfig();
  const [modalShow, setModalShow] = useState(false);
  const ENDPOINT = 'https://api.girls2dream.com/v1' || process.env.NEXT_PUBLIC_API_ENDPOINT;

  const onComplete = (resp: any) => {
    if (resp?.data?.url) {
      toast.success('Erfolgreich hochgeladen');
      onUploadAvatarComplete(resp?.data?.url);
      setModalShow(false);
    } else {
      toast.error('Hochladen fehlgeschlagen');
      setModalShow(false);
    }
  };

  const showModalUpload = (state: any) => {
    setModalShow(state);
  };
  return (
    <>
      <div className="avatar avatar-user mb-3" onClick={() => showModalUpload(true)}>
        <img className="avatar-img" src={avatarUrl || '/images/user.jpg'} alt="" />
        <a className="pro-edit">
          <i className="fas fa-pencil-alt text-white" />
        </a>
      </div>
      <ModalUpload
        url={`${ENDPOINT}/users/avatar`}
        onCompleteFile={onComplete}
        key="modal-upload"
        modalShow={modalShow}
        closeModal={(state: any) => showModalUpload(state)}
        config={{
          multiple: false,
          accept: 'image/*'
        }}
      />
    </>
  );
}

export default AvatarComponent;
