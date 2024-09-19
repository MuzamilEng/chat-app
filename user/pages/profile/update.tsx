import PageTitle from '@components/page-title';
import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { withAuth } from 'src/redux/withAuth';

const TokenPerMessageForm = dynamic(() => import('src/components/setting/token-per-message-form'));
const DeactiveProfileForm = dynamic(() => import('src/components/setting/deactive-profile-form'));
const VerificationDocument = dynamic(() => import('src/components/profile/personal/verification-document'));
const UpdatePasswordForm = dynamic(() => import('src/components/profile/personal/update-password-form'));
const PersonalProfileForm = dynamic(() => import('src/components/profile/personal/personal-profile-form'));

const mapStates = (state: any) => ({
  authUser: state.auth.authUser
});

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;

function UpdateProfile({
  authUser
}: PropsFromRedux) {
  const router = useRouter();
  const [showRq, setShowRq] = useState(false);
  const {t, lang} = useTranslationContext()


  useEffect(() => {
    if (router.query.requireUpdate === '1') {
      setShowRq(true);
    }
  }, []);

  return (
    <>
      <PageTitle title="Profil aktualisieren" />
      {/* <!-- Main Start --> */}
      <main className="main scroll">
        <div className="chats">
          <div className="chat-body p-3">
            <div className="row m-0 mb-4">
              <div className="col-md-12">
                <h4 className="font-weight-semibold">{t?.profilePage?.title}</h4>

                {showRq && (
                <div className="alert alert-warning" role="alert">
                 {lang === 'en' ? "Please update your profile to access the website." : "Bitte aktualisieren Sie Ihr Profil, um die Website zu betreten."}
                </div>
                )}
              </div>
            </div>
            <div className="row m-0">
              <div className="col-md-6">
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="mb-1">{t?.profilePage?.account}</h6>
                    <p className="mb-0 text-muted small">{t?.profilePage?.update}</p>
                  </div>
                  <PersonalProfileForm t={t} />
                </div>
              </div>
              <div className="col-md-6">
                {authUser.type === 'model' && <TokenPerMessageForm />}
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="mb-1">{t?.passwordPage?.title}</h6>
                    <p className="mb-0 text-muted small">{t?.passwordPage?.update}</p>
                  </div>
                  <UpdatePasswordForm />
                </div>

                <DeactiveProfileForm />
                {authUser?.type === 'model' && !authUser?.isApproved && !authUser?.verificationDocument?.firstName && (
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="mb-1">{lang === 'en' ? 'Verification Document' : 'Überprüfungsdokument'}</h6>
                    <p className="mb-0 text-muted small">{lang === 'en' ? 'Update evidence document' : 'Nachweisdokument aktualisieren'}</p>
                  </div>
                  <div className="card-body">
                    <VerificationDocument />
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* <!-- Main End --> */}
    </>
  );
}

export default withAuth(connector(UpdateProfile));
