import ChatButton from '@components/conversation/chat-button';
import FromNow from '@components/from-now';
import { contactService } from '@services/contact.service';
import { useTranslationContext } from 'context/TranslationContext';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { IUser } from 'src/interfaces/user';

type IProps = {
  authUser: any;
  user: IUser & MoreUserProps;
  showBio?: boolean;
};

type MoreUserProps = {
  isFriend: boolean;
  age: number;
};

const mapStates = (state: any) => ({
  authUser: state.auth.authUser
});

const connector = connect(mapStates);

function UserListItem({
  authUser,
  user,
  showBio = false
}: IProps) {
  const isFriend = useRef<boolean>(user.isFriend);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {t, lang} = useTranslationContext();


  // TODO - detect with user gender
  const avatarUrl = user.avatarUrl || '/images/user3.jpg';

  const removeContact = async () => {
    try {
      if (loading) return;
      // TODO - prevent click too many times
      setLoading(true);
      await contactService.remove(user._id);
      isFriend.current = false;
      setLoading(false);
      toast.success(`${user.username} Wurde von deiner Favoritenliste entfernt.!`);
    } catch (e) {
      const err = await e;
      toast.error(err?.data?.message || 'Ein Fehler ist aufgetreten, bitte versuchen Sie es später erneut!');
    }
  };

  const addContact = async () => {
    if (authUser.type === 'model') {
      toast.error('Es tut uns leid. Nur Benutzer können Modelle als Favoriten markieren.');
    } else {
      try {
        if (loading) return;
        setLoading(true);
        await contactService.add({
          userId: user._id
        });
        isFriend.current = true;
        setLoading(false);
        toast.success(`${user.username} Der Artikel wurde zu deiner Favoritenliste hinzugefügt!`);
      } catch (e) {
        const err = await e;
        toast.error(err?.data?.message || 'Ein Fehler ist aufgetreten, bitte versuchen Sie es später erneut!');
      }
    }
  };

  const checkProfile = async () => {
    router.push(
      { pathname: '/models/[username]', query: { username: user.username } },
      `/${lang}/models/${user.username}`
    );
  };

  const getGenderText = () => {
    switch (user.gender) {
      case 'male': return 'M';
      case 'female': return 'F';
      default: return 'Trans';
    }
  };

  // view for friend / favourite list
  if (showBio) {
    return (
      <Col xs={6} sm={4} md={3} className="mb-3 contact-cart" key={user._id}>
        <div className="card card-body card-bg-1">
          <span style={{ position: 'absolute', zIndex: 99 }}>
            <FromNow time={user.lastActivity} />
          </span>
          <div className="d-flex flex-column align-items-center">
            <div
              className="avatar avatar-lg position-relative pointer"
            >
              <div
                className="image"
                style={{ backgroundImage: `url(${avatarUrl}` }}
                onClick={checkProfile}
              />
              <div className="friend-status position-absolute">
                {isFriend.current === true
                  ? <i className="fas fa-heart filled" onClick={removeContact} />
                  : <i className="far fa-heart" onClick={addContact} />}
              </div>
              <div className="position-absolute common-info">
                <div className="username">{user.username}</div>
                <div className="gender-and-age">
                  {' '}
                  <i className="fas fa-venus-mars" />
                  {' '}
                  {getGenderText()}
                  {' '}
                  |
                  {' '}
                  <i className="far fa-calendar-minus" />
                  {' '}
                  {user.age}
                </div>
              </div>
            </div>
            <div className={user.bio && user.bio.length > 190 ? 'd-flex flex-column bio ellipsis' : 'd-flex flex-column bio'}>
              <h6>{user.bio && user.bio.length > 190 ? `${user.bio.substring(0, 190)}...` : user.bio}</h6>
            </div>
            <div className="d-flex group-btn">
              <ChatButton isFriend={isFriend.current} user={user} />
              <button
                className="btn btn-primary btn-secondary mx-1"
                type="button"
                onClick={checkProfile}
              >
                <i className="fas fa-user-circle" />
                <span> {t?.modelLists?.profile}</span>
              </button>
            </div>
          </div>
        </div>
      </Col>
    );
  }

  return (
    <Col xs={6} sm={4} md={3} className="mb-3 contact-cart size-contact-card" key={user._id}>
      <div className="card card-body card-bg-1">
        <span style={{ zIndex: 99 }} className="position-absolute mt-1 ml-2 time-last-activity">
          <FromNow time={user.lastActivity} />
        </span>
        <div className="d-flex flex-column align-items-center">
          <div className="avatar avatar-lg position-relative pointer">
            <div
              className="image"
              style={{ backgroundImage: `url(${avatarUrl}` }}
              onClick={checkProfile}
            />
            <div className="friend-status position-absolute">
              {isFriend.current === true
                ? <i className="fas fa-heart filled" onClick={removeContact} /> : (
                  <i className="far fa-heart" onClick={addContact} />
                )}
            </div>
            <div className="hover-btn-chat">
              <ChatButton isFriend={isFriend.current} user={user} />
              <OverlayTrigger
                placement="top"
                overlay={(
                  <Tooltip id="tooltip">
                    <span className="text-tooltip">{t?.modelLists?.profile}</span>
                  </Tooltip>
                )}
              >
                <button
                  className="btn btn-primary btn-secondary mx-1 btn-link"
                  type="button"
                  onClick={checkProfile}
                  disabled={loading}
                >
                  <i className="fas fa-user-circle" />
                  <span className="ml-1 text-chat">{t?.modelLists?.profile}</span>
                </button>
              </OverlayTrigger>
            </div>
            <div className="position-absolute common-info" onClick={checkProfile}>
              <div className="username">{user.nickname ? user.nickname : user.username}</div>
              <div className="gender-and-age">
                {' '}
                <i className="fas fa-venus-mars" />
                {' '}
                {getGenderText()}
                {' '}
                |
                {' '}
                <i className="far fa-calendar-minus" />
                {' '}
                {user.age}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Col>
  );
}

export default connector(UserListItem);
