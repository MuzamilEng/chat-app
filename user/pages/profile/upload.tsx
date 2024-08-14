import PageTitle from '@components/page-title';
import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import { withAuth } from 'src/redux/withAuth';

const FormMedia = dynamic(() => import('src/components/media/form-media'));

function UploadMedia() {
  const {t, lang} = useTranslationContext()
  return (
    <main className="main scroll">
      <PageTitle title="Medien hochladen" />
      <div className="chats">
        <div className="chat-body p-3">
          <div className="row m-0 mb-4">
            <div className="col-md-12">
              <h4 className="font-weight-semibold">{lang === 'en' ? "Upload Media" : "Medien hochladen"}</h4>
            </div>
          </div>
          <FormMedia />
        </div>
      </div>
    </main>
  );
}

export default withAuth(UploadMedia);
