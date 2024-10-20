import SendTipButton from '@components/contact/send-tip-button';
import PageTitle from '@components/page-title';
import { conversationService } from '@services/conversation.service';
import { userService } from '@services/user.service';
import classNames from 'classnames';
import { useTranslationContext } from 'context/TranslationContext';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { toast } from 'react-toastify';
// Child component
import SearchBar from 'src/components/chat-box/header/search-bar';
// Actions
import { blockConversation, deleteConversation, unBlockConversation } from 'src/redux/conversation/actions';
import { loadMessage, setUsingSearchBar } from 'src/redux/message/actions';

interface IProps {
  usingSearchBar?: boolean;
}

const mapStateToProps = (state: any) => ({
  recipient: state.message.recipient,
  usingSearchBar: state.message.usingSearchBar,
  selectedConversation: state.conversation.selectedConversation,
  authUser: state.auth.authUser
});

const mapDispatch = {
  dpLoadMessage: loadMessage,
  dpBlockConversation: blockConversation,
  dpUnBlockConversation: unBlockConversation,
  dpDeleteConversation: deleteConversation,
  dpSetUsingSearchBar: setUsingSearchBar
};

const connector = connect(mapStateToProps, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

function ChatHeader({
  authUser,
  recipient,
  selectedConversation,
  usingSearchBar = false,
  dpBlockConversation,
  dpUnBlockConversation,
  dpDeleteConversation,
  dpLoadMessage,
  dpSetUsingSearchBar
}: IProps & PropsFromRedux) {
  const [isSearch, setIsSearch] = useState(usingSearchBar || false);
  const [dropdown, openDropdown] = useState(false);
  const [miniDropdown, openMiniDropdown] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false); // Control modal visibility
  const [reminderText, setReminderText] = useState('');
  const [isBlocked, setIsBlocked] = useState(
    selectedConversation.blockedIds?.findIndex((blockedId) => blockedId === recipient._id) > -1
  );

  const {lang} = useTranslationContext()

  const onMouseDown = (e: any) => {
    if (document.getElementById('action-selector')?.contains(e.target)) {
      // Clicked in box
    } else {
      // Clicked outside the box
      openDropdown(false);
    }
    if (document.getElementById('mini-action-selector')?.contains(e.target)) {
      // Clicked in box
    } else {
      // Clicked outside the box
      openMiniDropdown(false);
    }
  };

  useEffect(() => {
    // Anything in here is fired on component mount.
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      // Anything in here is fired on component unmount.
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  const handleOutsideClick = (e: any) => {
    if (!document.getElementById('reminder-modal')?.contains(e.target)) {
      setShowReminderModal(false);
    }
  };

  const handleReminderClick = () => {
    setShowReminderModal(true); // Show modal when reminder button is clicked
  };

  const handleSaveReminder = async (e) => {
    e.preventDefault();
   try {
    const resp = await userService.addSecretInfo({
      conversationId: selectedConversation._id,
      info: reminderText
    })
    if(resp){
      toast.success(lang === 'en' ? 'Reminder saved!' : 'Erinnerung gespeichert!');
    setShowReminderModal(false);
    }
   } catch (error) {
    toast.error('Failed to save reminder');
   } // Close modal after saving
  };

  const handleCloseModal = () => {
    setShowReminderModal(false);
  };

  const handleBlockConversation = async () => {
    const conversationId = selectedConversation._id;
    const blockedId = recipient._id;
    try {
      await conversationService.block(conversationId, { blockedId });
      if (authUser?.type === 'model') {
        toast.success( lang === 'en' ? 'You have blocked this user. You will not be able to send or receive messages.' :  'Du hast diesen Benutzer blockiert. Du wirst keine Nachrichten senden oder empfangen können.');
      } else if (authUser?.type === 'user') {
        toast.success( lang === 'en' ? 'You have blocked this model. You will not be able to send or receive messages.' : 'Du hast dieses Modell blockiert. Du wirst keine Nachrichten senden oder empfangen können.');
      }
      dpBlockConversation({ conversationId, blockedId });
    } catch (e) {
      const error = await e;
      if (authUser?.type === 'model') {
        toast.error(error?.message || lang === 'en' ? 'The user could not be blocked.' : 'Das Blockieren dieses Benutzers ist fehlgeschlagen!');
      } else if (authUser?.type === 'user') {
        toast.error(error?.message || lang === 'en' ? 'The model could not be blocked.' : 'Das Blockieren dieses Modells ist fehlgeschlagen!');
      }
    }
  };

  const handleUnBlockConversation = async () => {
    const conversationId = selectedConversation._id;
    const blockedId = recipient._id;
    try {
      await conversationService.unBlock(conversationId, { blockedId });
      if (authUser?.type === 'model') {
        toast.success( lang === 'en' ? 'You have unblocked this user.' : 'Du hast diesen Benutzer entsperrt.');
      } else if (authUser?.type === 'user') {
        toast.success( lang === 'en' ? 'You have unblocked this model.' : 'Du hast dieses Modell entsperrt.');
      }
      dpUnBlockConversation({ conversationId, blockedId });
    } catch (e) {
      const error = await e;
      if (authUser?.type === 'model') {
        toast.error(error?.message || lang === 'en' ? 'The user could not be unblocked.' : 'Das Entsperren dieses Benutzers ist fehlgeschlagen!');
      } else if (authUser?.type === 'user') {
        toast.error(error?.message ||  lang === 'en' ? 'The model could not be unblocked.' : 'Das Entsperren dieses Modells ist fehlgeschlagen!');
      }
    }
  };

  const getSecretInformation = async ()=> {
    const resp = await userService.getSecretInfo(selectedConversation._id)
    if(resp?.data?.info){
      setReminderText(resp?.data?.info);
    }
  }

  const handleBlockBtn = () => {
    if (isBlocked) {
      handleUnBlockConversation();
      setIsBlocked(false);
    } else {
      handleBlockConversation();
      setIsBlocked(true);
    }
  };

  const handleSearch = (query: any) => {
    dpLoadMessage({ conversationId: selectedConversation._id, query: { ...query, page: 1, take: 100 } });
    setTimeout(() => dpSetUsingSearchBar(true), 700);
  };

  const handleLoadAllMessage = () => {
    dpLoadMessage({ conversationId: selectedConversation._id, query: { page: 1, take: 20 } });
  };

  const onClickAvatarChatroom = () => {
    if (recipient?.type === 'model') {
      Router.push(`/models/${recipient?.username}`);
    }
  };

  const deletedConversation = async (conversationId: string) => {
    try {
      const resp = await conversationService.delete(conversationId);
      toast.success(resp.data.data.message || lang === 'en' ? 'Conversation deleted successfully!' : 'Das Löschen des Gesprächs war erfolgreich!');
      dpDeleteConversation(conversationId);
      Router.push('/conversation');
    } catch (e) {
      const error = await e;
      toast.error(error?.message || lang === 'en' ? 'Failed to delete conversation!' : 'Das Löschen des Gesprächs ist fehlgeschlagen!');
    }
  };
  useEffect(() => {
    getSecretInformation();
  }, []);

  return (
    <>
      <PageTitle title={!recipient ? '...' : `Chatten mit ${recipient.username}`} />
      {/* <!-- Chat Header Start--> */}
      <div  className="chat-header" style={{ justifyContent: 'flex-start' }}>
        {/* <!-- Chat Back Button (Visible only in Small Devices) --> */}
        <button
          className="btn btn-secondary btn-icon btn-minimal btn-sm text-muted d-xl-none"
          type="button"
          data-close=""
          onClick={() => Router.push('/conversation')}
        >
          <svg className="hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex chat-name align-items-center text-truncate pointer mx-1" onClick={() => onClickAvatarChatroom()}>
          <div
            className={`avatar mr-3 ${recipient?.isOnline ? ' avatar-online' : 'avatar-offline'
            }`}
          >
            <img src={recipient?.avatarUrl || '/images/user1.jpg'} alt=""
              onError={(e) => e.currentTarget.src = 'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'}
             />
          </div>

          <div className="media-body align-self-center">
            <h6 className="text-truncate mb-0">{recipient?.username}</h6>
            <small className="text-muted">{recipient?.isOnline ? 'Online' : 'Offline'}</small>
          </div>
         {authUser?.type === 'model' && <button onClick={handleReminderClick} style={{marginLeft: '2vw'}} className="btn btn-primary btn-sm">notes✏️</button>}
        </div>
        {/* the modal here */}
        {showReminderModal && (
  <form className="" onSubmit={handleSaveReminder}
    id="reminder-drawer"
    style={{
      position: 'fixed',
      top: '3vw',
      right: '0', // Drawer will slide in from the right
      height: '100%',
      width: '300px', // You can adjust the width as per your needs
      backgroundColor: 'white',
      padding: '20px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      zIndex: 1000, // Make sure it's on top of everything
      transition: 'transform 0.3s ease-in-out', // Smooth slide-in effect
      transform: showReminderModal ? 'translateX(0)' : 'translateX(100%)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h5>{lang === 'en' ? 'Set Reminder' : 'Erinnerung einstellen'}</h5>
      <button className="btn btn-light" onClick={handleCloseModal}>
        X
      </button>
    </div>
    <textarea
      value={reminderText}
      onChange={(e) => setReminderText(e.target.value)}
      placeholder={lang === 'en' ? 'Write your reminder here...' : 'Schreiben Sie hier Ihre Erinnerung...'}
      rows={5}
      style={{
        width: '100%',
        marginTop: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
      }}
    ></textarea>
    <div style={{ marginTop: '10px', textAlign: 'right' }}>
      <button className="btn btn-secondary" onClick={handleCloseModal}>
        {lang === 'en' ? 'Cancel' : 'Abbrechen'}
      </button>
      <button className="btn btn-primary" type="submit" style={{ marginLeft: '10px' }}>
        {lang === 'en' ? 'Save' : 'Speichern'}
      </button>
    </div>
  </form>
)}
     {/* <!-- Chat Options --> */}
        <ul className="nav flex-nowrap ml-auto">
          {authUser.type === 'user' && recipient?.type === 'model' && (
            <li>
              <SendTipButton model={recipient} />
            </li>
          )}
          <li className="nav-item list-inline-item d-none d-sm-block mr-1">
            <a
              aria-hidden
              className="nav-link text-muted px-1"
              data-toggle="collapse"
              data-target="#searchCollapse"
              aria-expanded="false"
              onClick={() => setIsSearch(!isSearch)}
            >
              <svg className="hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </a>
          </li>
          <li className="nav-item list-inline-item d-none d-sm-block mr-0">
            <div className="dropdown">
              <a
                aria-hidden
                className="nav-link text-muted px-1"
                role="button"
                title="Details"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={() => openDropdown(!dropdown)}
              >
                <svg className="hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </a>
              <div
                id="action-selector"
                className={dropdown ? 'dropdown-menu dropdown-menu-right show' : 'dropdown-menu dropdown-menu-right'}
              >
                <a
                  aria-hidden
                  className="dropdown-item align-items-center d-flex"
                  onClick={() => deletedConversation(selectedConversation._id)}
                >
                  <svg className="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>{lang === 'en' ? 'Delete' : 'Löschen'}</span>
                </a>
                <a
                  aria-hidden
                  className="dropdown-item align-items-center d-flex text-danger text-white"
                  onClick={handleBlockBtn}
                >
                  <svg className="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                </a>
              </div>
            </div>
          </li>
          <li className="nav-item list-inline-item d-sm-none mr-0">
            <div className="dropdown">
              <a
                aria-hidden
                className="nav-link text-muted px-1"
                role="button"
                title="Details"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={() => openMiniDropdown(!miniDropdown)}
              >
                <svg className="hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </a>

              <div
                id="mini-action-selector"
                className={
                  miniDropdown ? 'dropdown-menu dropdown-menu-right show' : 'dropdown-menu dropdown-menu-right'
                }
              >
                <a
                  aria-hidden
                  className={classNames('dropdown-item align-items-center d-flex', { 'text-danger': isSearch })}
                  data-toggle="collapse"
                  data-target="#searchCollapse"
                  aria-expanded="false"
                  onClick={() => setIsSearch(!isSearch)}
                >
                  <svg className="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>{lang === 'de' ? 'Suche' : 'Search'}</span>
                </a>
                <a
                  aria-hidden
                  className="dropdown-item align-items-center d-flex"
                  onClick={() => {
                    deletedConversation(selectedConversation._id);
                    openMiniDropdown(!miniDropdown);
                  }}
                >
                  <svg className="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>{lang === 'de' ? 'Löschen' : 'Delete'}</span>
                </a>
                <a
                  aria-hidden
                  className="dropdown-item align-items-center d-flex"
                  onClick={() => {
                    handleBlockBtn();
                    openMiniDropdown(!miniDropdown);
                  }}
                >
                  <svg className="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>
      {/* <!-- Chat Header End--> */}

      {/* <!-- Search Start --> */}
      <div
        className={isSearch ? 'collapse border-bottom px-3 show' : 'collapse border-bottom px-3'}
        id="searchCollapse"
      >
        <SearchBar handleSearch={handleSearch} />
      </div>

      {usingSearchBar && (
        <div className="text-center">
          <span aria-hidden className="badge badge-secondary" onClick={handleLoadAllMessage}>
            <small>{lang === 'en' ? 'Load all messages' : 'Alle Nachrichten'}</small>
          </span>
        </div>
      )}
    </>
  );
}

export default connector(ChatHeader);
