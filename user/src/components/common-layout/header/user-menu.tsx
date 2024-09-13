import { formatNumber } from '@lib/utils';
import { useTranslationContext } from 'context/TranslationContext';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';

interface IProps {
  username: string;
  type: string
  logout: Function
  avatarUrl: string;
  balance: number;
  handleClickToMenu: Function;
}
function UserMenu({
  username,
  type,
  logout,
  avatarUrl,
  balance,
  handleClickToMenu
}: IProps) {
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.authUser);
  const [activeRoute, setActiveRoute] = useState(null);
  const {t, lang} = useTranslationContext();

  const onClickMenu = (url: string, pathname: string) => {
    handleClickToMenu();
    return router.push(url, pathname, { shallow: true });
  };

  const handleRouteChange = (path) => setActiveRoute(path);

  useEffect(() => {
    handleRouteChange(router.pathname);

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  return (
    <Dropdown drop="down">
      <Dropdown.Toggle
        variant="link"
        className="nav-link dropdown-toggle dropdown-profile-menu"
        id="navbarDropdownMenuLink"
        role="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
          <img alt="avatar_user" src={avatarUrl || '/images/user.jpg'}
          onError={(e) => e.currentTarget.src = 'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'}
          />
        <div className="username hide-mobile">{username || ' N/A '}</div>
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu dropdown-menu-link dropdown-menu-profile" aria-labelledby="navbarDropdownMenuLink">
        <Dropdown.Item className="show-mobile">
          <img alt="avatar_user" src={avatarUrl || '/images/user.jpg'} />
          <div className="username ">{username || ' N/A '}</div>
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => onClickMenu(`/${lang}/profile/update`, `/${lang}/profile/update`)}
          active={activeRoute === '/profile/update'}
        >
         {t?.dropdown?.profile}
        </Dropdown.Item>
        {type === 'model' && (
          <>
            <Dropdown.Item
              className="show-mobile"
              onClick={() => onClickMenu('/profile/payout-request', '/payout-request')}
              active={['/profile/payout-request', '/payout-request'].includes(activeRoute)}
            >
              <a
                className="show-mobile w-100 my-1  btn btn-outline-primary "
              >
                <i className="fa fa-heart mr-1" />
                {formatNumber(balance)}
              </a>
            </Dropdown.Item>
            
            <Dropdown.Item
          onClick={() => onClickMenu(`/${lang}/blogs/allblogs/${user._id}`, `/${lang}/blogs/allblogs/${user._id}`)}
          active={activeRoute === `/blogs/allblogs/${user._id}`}
        >
         {t?.dropdown?.blogs}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => onClickMenu(`/${lang}/profile/interests`, `/${lang}/profile/interests`)}
          active={activeRoute === `/profile/interests`}
        >
         {lang === 'en' ? 'Interests': 'Interesses'}
        </Dropdown.Item>
            <Dropdown.Item
              onClick={() => onClickMenu('/profile/media-content', `/${lang}/media-content`)}
              active={['/profile/media-content', '/media-content'].includes(activeRoute)}

            >
              {t?.dropdown?.media}
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => onClickMenu('/profile/payout-request', `/${lang}/payout-request`)}
              active={['/profile/payout-request', '/payout-request'].includes(activeRoute)}
            >
              {t?.dropdown?.payout}

            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => onClickMenu(`/${lang}/earning`, `/${lang}/earning`)}
              active={activeRoute === '/earning'}
            >
              {t?.dropdown?.earnings}

            </Dropdown.Item>
          </>
        )}
        {type === 'user' && (
          <>
            <Dropdown.Item
              className="show-mobile"
              onClick={() => onClickMenu(`/${lang}/earning`, `/${lang}/earning`)}
              active={['/tokens', '/tokens'].includes(activeRoute)}
            >
              <a
                className={`w-100 my-1 nav-link btn btn-outline-primary no-box-shadow ${activeRoute === 'tokens' ? 'active' : ''}`}
              >
                <i className="fa fa-heart  mr-1" />
                {formatNumber(balance)}
              </a>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => onClickMenu('/profile/purchased-media', `/${lang}/purchased-media`)}
              active={['/profile/purchased-media', '/purchased-media'].includes(activeRoute)}
            >
              {t?.dropdown?.media}
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => onClickMenu('/profile/bookmarked-messages', `/${lang}/bookmarked-messages`)}
              active={['/profile/bookmarked-messages', '/bookmarked-messages'].includes(activeRoute)}

            >
              {t?.dropdown?.bookmarkMsg}
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => onClickMenu('/tokens/history', `/${lang}/token-history`)}
              active={['/tokens/history', '/token-history'].includes(activeRoute)}
            >
              {t?.dropdown?.token}
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => onClickMenu('/payment-history', `/${lang}/payment-history`)}
              active={activeRoute === '/payment-history'}
            >
              {t?.dropdown?.payment}
            </Dropdown.Item>
          </>
        )}
        <Dropdown.Item
          onClick={() => onClickMenu('/contact-us', `/${lang}/contact-us`)}
          active={activeRoute === '/contact-us'}
        >
          {t?.dropdown?.contact}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => logout()}>{t?.dropdown?.logout}</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default UserMenu;
