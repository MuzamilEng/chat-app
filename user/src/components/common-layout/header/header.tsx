import NotificationHeaderIcon from '@components/notification/notification-header-icon';
import { formatNumber } from '@lib/utils';
import { conversationService } from '@services/conversation.service';
import classNames from 'classnames';
import Router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Button
} from 'react-bootstrap';
import { connect, ConnectedProps, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from 'src/redux/auth/actions';
import { updateTotalUnreadMessage } from 'src/redux/conversation/actions';

import SendMailModal from './send-mail.modal';
import UserMenu from './user-menu';
import { useTranslationContext } from 'context/TranslationContext';

const mapStates = (state: any) => ({
  isLoggedIn: state.auth.isLoggedIn,
  authUser: state.auth.authUser,
  appConfig: state.system.config,
  conversations: state.conversation.items
});

const mapDispatch = { logout, dpUpdateTotalUnreadMessage: updateTotalUnreadMessage };

const connector = connect(mapStates, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

function Header({
  authUser, appConfig, isLoggedIn,
  logout: handleLogout,
  dpUpdateTotalUnreadMessage
}: PropsFromRedux) {
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const {t, setCheckPaidMedia, lang} = useTranslationContext()


  const router = useRouter();
  const totalUnreadMessage = useSelector((state: any) => state.conversation.totalUnreadMessage);

  const handleClickToMenu = () => {
    setShowInviteUser(false);
  };

  const onClickMenu = (url: string, pathname: string) => {
    handleClickToMenu();
    return router.push(url, pathname, { shallow: true });
  };

  const handleRouteChange = (path, asPath) => {
    if (path === '/favorites' || asPath === '/favorites') return setActiveRoute('favorites');
    if (path === '/tokens') return setActiveRoute('tokens');
    if (path === '/payout-request' || asPath === '/payout-request') return setActiveRoute('payout-request');

    if (path.includes('conversation')) return setActiveRoute('conversation');

    if (path.includes('models')) return setActiveRoute('models');
    return null;
  };

  useEffect(() => {
    handleRouteChange(router.pathname, router.asPath);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  const getTotalUnreadmessage = async () => {
    try {
      const resp = await conversationService.getTotalUnreadmessage();
      dpUpdateTotalUnreadMessage(resp.data);
      setCheckPaidMedia(true);
    } catch (e) {
      const error = await e;
      toast.error(error?.message || 'Das Laden der Gesamtanzahl ungelesener Nachrichten ist fehlgeschlagen.');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      getTotalUnreadmessage();
    } else {
      // Router.push('/');
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light top-nav navbar-menu-mobile">
      <a aria-hidden className={`navbar-brand ${activeRoute === 'models' && 'active'}`} href={`/${lang}/models`}>
        <img alt="img_logo_header" src={appConfig.siteLogo || '/images/logo_0.png'} />
      </a>
      <div className="navbar-menu">
        <div className="collapse navbar-collapse show" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item" data-toggle="tooltip" title="Chat Room">
              <Button
                className={
                classNames('flex', {
                  'custom-btn btn-chatroom': activeRoute !== 'conversation' && totalUnreadMessage > 0
                })
              }
                onClick={() => onClickMenu(`/${lang}/conversation`, `/${lang}/conversation`)}
              >
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
                {' '}
                <span className="hide-mobile">{t?.header?.chat}</span>
              </Button>
              {totalUnreadMessage > 0 && activeRoute !== 'conversation' && (
                <p>
                  <span className="new-message">
                    {totalUnreadMessage}
                  </span>
                </p>
              ) }
            </li>
            <li className="nav-item" data-toggle="tooltip" title="Friends">
              <a 
                aria-hidden style={{ cursor: 'pointer', color: 'white', borderRadius: '0.2vw'}}
                className={`nav-link custom-btn btn-chatroom ${activeRoute === 'friends' && 'active'}`}
                onClick={() => onClickMenu(`/${lang}/friends`, `/${lang}/friends`)}
              >
                <i className="fa fa-users" />
                {' '}
                <span className="hide-mobile">{lang === 'en' ? 'Friends' : 'Freunde'}</span>
              </a>
            </li>
            {authUser?.type === 'user'
              && (
              <li className="nav-item" data-toggle="tooltip" title="Balance">
                <a
                  aria-hidden
                  className={`hide-mobile w-100 my-1 nav-link btn btn-outline-primary no-box-shadow ${activeRoute === 'tokens' ? 'active' : ''}`}
                  onClick={() => onClickMenu('/tokens', '/tokens')}
                >
                  <i className="fa fa-heart" />
                  {' '}
                  {formatNumber(authUser?.balance)}
                </a>
              </li>
              )}
            {authUser?.type === 'model'
              && [
                <li className="nav-item" data-toggle="tooltip" title="Balance">
                  <a
                    aria-hidden
                    className={`hide-mobile w-100 my-1 nav-link btn btn-outline-primary no-box-shadow ${activeRoute === 'payout-request' ? 'active' : ''}`}
                    onClick={() => onClickMenu('/profile/payout-request', `/${lang}/payout-request`)}
                  >
                    <i className="fa fa-heart" />
                    {' '}
                    {formatNumber(authUser?.balance)}
                  </a>
                </li>,
                <li className="nav-item " key="notification" data-toggle="tooltip" title="Notification">
                  <NotificationHeaderIcon />
                </li>
              ]}
            <li className="nav-item" data-toggle="tooltip" title="All Models">
              <a
                aria-hidden
                className={`nav-link ${activeRoute === 'models' && 'active'}`}
                onClick={() => onClickMenu(`/${lang}/models`, `/${lang}/models`)}
              >
                <i className="fa fa-users" />
                {' '}
                <span className="hide-mobile">{t?.header?.models}</span>
              </a>
            </li>
            {authUser?.type === 'user'
              && [
                <li className="nav-item" data-toggle="tooltip" title="My Favorites">
                  <a
                    aria-hidden
                    className={`nav-link ${activeRoute === 'favorites' && 'active'}`}
                    onClick={() => onClickMenu(`/${lang}/favorites`, `/${lang}/favorites`)}
                  >
                    <i className="far fa-heart" />
                    {' '}
                    <span className="hide-mobile">{t?.header?.favorites}</span>
                  </a>
                </li>]}
            <li className="nav-item ">
              <a
                aria-hidden
                className="nav-link"
                role="button"
                data-toggle={['modal', 'tooltip']}
                title="Invite Users"
                data-target="#inviteUsers"
                onClick={() => {
                  setShowInviteUser(true);
                  if (authUser && (!authUser.isCompletedProfile || !authUser.isApproved)) {
                    toast.error('Bitte aktualisieren Sie Ihr Profil, um die Website einzugeben.');
                    return router.pathname !== '/profile/update' && router.push(`/${lang}/profile/update?requireUpdate=1`);
                  } return {};
                }}
              >
                <i className="fas fa-user-plus" />
                {' '}
                <span className="hide-mobile">{t?.header?.invite}</span>
              </a>
            </li>
            <li className="nav-item dropdown user-dropdown" data-toggle="tooltip" title="My profile">
              <UserMenu
                key="user-menu"
                logout={handleLogout}
                {...authUser}
                {...appConfig}
                handleClickToMenu={handleClickToMenu}
              />
            </li>
          </ul>
        </div>
      </div>
      <SendMailModal
        state={showInviteUser && authUser?.isCompletedProfile && authUser?.isApproved}
        setState={() => setShowInviteUser(!showInviteUser)}
      />
    </nav>
  );
}

export default connector(Header);
