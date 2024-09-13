import { contactService } from '@services/contact.service';
import { useState } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { IUser } from 'src/interfaces/user';

import ShareLoveModal from './modal/share-love-modal';
import { useTranslationContext } from 'context/TranslationContext';

type IProps = {
  model: any;
  authUser: IUser;
};

function SendTipButton({
  authUser,
  model
}: IProps) {
  const [showModal, setShowModal] = useState(false);
  const {t} = useTranslationContext()

  const sendTip = async ({ token }) => {
    try {
      await contactService.shareLove({
        token,
        modelId: model?._id
      });
      toast.success('Das Trinkgeld wurde gesendet!');
      setShowModal(false);
    } catch (e) {
      const err = await e;
      toast.error(err?.message || 'Senden des Trinkgelds fehlgeschlagen');
    }
  };

  const handleShareTip = async () => {
    if (authUser._id === model?._id) {
      toast.error('Sie können das Trinkgeld nicht selbst teilen.');
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <a
        className="btn btn-primary text-light mx-2 my-1 pointer"
        onClick={() => handleShareTip()}
      >
        <i className="far fa-heart" />
        {' '}
        {t?.sendTip}
      </a>
      <ShareLoveModal
        show={showModal}
        modelId={model?._id}
        onShare={sendTip}
        onCancel={() => setShowModal(!showModal)}
      />
    </>
  );
}

const mapStateToProps = (state: any) => ({
  authUser: state.auth.authUser
});

export default connect(mapStateToProps)(SendTipButton) as any;
