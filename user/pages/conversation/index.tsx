import PageTitle from '@components/page-title';
import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { connect, ConnectedProps } from 'react-redux';
import { withAuth } from 'src/redux/withAuth';

const mapStates = (state: any) => ({
  authUser: state.auth.authUser
});

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;

const ConversationSideBar = dynamic(() => import('src/components/common-layout/sidebar/conversation-sidebar'));

function ConversationHomePage({
  authUser
}: PropsFromRedux) {
  const {t, lang} = useTranslationContext()

  return (
    <>
      <PageTitle title="Conversation" />
      <ConversationSideBar />
      <main className="main">
        {/* <!-- Chats Page Start --> */}
        <div className="chats">
          <div className="chat-body">
            <div className="chat-header no-border">
              {/* <!-- Chat Back Button (Visible only in Small Devices) --> */}
              <button
                className="btn btn-secondary btn-icon btn-minimal btn-sm text-muted d-xl-none"
                type="button"
                data-close=""
              >
                {/* <!-- Default :: Inline SVG --> */}
                <svg className="hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            </div>
            <div className="d-flex flex-column justify-content-center text-center h-100 w-100">
              <div className="container">
                <div className="avatar avatar-lg mb-2">
                  <img className="avatar-img" src={authUser.avatarUrl || '/images/user.jpg'} alt="" />
                </div>

                <h5>
                {t?.welcome},
                  {authUser.username}
                  !
                </h5>
                <p className="text-muted">
               {t?.conversationMsg}
                  {' '}
                  <a onClick={() => Router.push('/models')}>{lang === 'en' ? 'All Models' : 'Alle Modelle'}</a>
                  {' '}
                  oben.
                </p>

                {/* <a
                  className="btn btn-outline-primary no-box-shadow"
                  type="button"
                  onClick={() => Router.push('/contact/create')}>
                  <i className="fas fa-user-plus"></i> Add to Favorites
                </a> */}
              </div>
            </div>
          </div>
        </div>
        {/* <!-- Chats Page End --> */}
      </main>
      {/* <!-- Main End --> */}
    </>
  );
}

export default withAuth(connector(ConversationHomePage));
