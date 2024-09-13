import moment from 'moment';
import { connect, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  addBookmarkedMessage, removeBookmarkMessage,
  removeMessage
} from 'src/redux/message/actions';
import { mediaService, messageService } from 'src/services';

import MediaContent from './media-content';

interface IProps {
  items?: any;
  authUser?: any;
}
const now = moment(new Date(), 'DD/MM/YYYY HH:mm:ss');

const mapStateToProps = (state: any) => ({ authUser: state.auth.authUser, ...state.message });

const connector = connect(mapStateToProps);

function ChatContent({ items = null, authUser = null }: IProps) {
  const distpatch = useDispatch();

  const handleRemoveMessage = async (e: any, messageId: string) => {
    e.preventDefault();
    try {
      const resp = await messageService.delete(messageId);
      toast.success(resp?.data?.data?.message || 'Die Nachricht wurde erfolgreich entfernt!');
      distpatch(removeMessage(messageId));
    } catch (err) {
      const error = await err;
      toast.error(error?.message || 'Die Nachricht konnte nicht entfernt werden!');
    }
  };

  const handleAddBookmarkedMessage = async (e: any, messageId: string) => {
    e.preventDefault();
    try {
      const resp = await messageService.addBookmarked({ messageId });
      toast.success('Hinzufügen des markierten Nachrichtenerfolgs');
      distpatch(addBookmarkedMessage({ messageId, bookmarkId: resp.data.id }));
    } catch (err) {
      const error = await err;
      toast.error(error?.message || 'Hinzufügen der markierten Nachricht fehlgeschlagen!');
    }
  };

  const handleRemoveBookmarkedMessage = async (e: any, bookmarkId: string, messageId: string) => {
    e.preventDefault();
    try {
      await messageService.removeBookmarked(bookmarkId);
      toast.success('Entfernen der markierten Nachricht erfolgreich');
      distpatch(removeBookmarkMessage({ messageId }));
    } catch (err) {
      const error = await err;
      toast.error(error?.message || 'Entfernen der markierten Nachricht fehlgeschlagen!');
    }
  };

  const handleDownloadFile = async (mediaId: string) => {
    try {
      const resp = await mediaService.download(mediaId);
      const a = document.createElement('a');
      a.href = resp.data.href;
      a.target = '_blank';
      a.click();
    } catch (e) {
      const error = await e;
      toast.error(error?.message || 'Datei konnte nicht heruntergeladen werden!');
    }
  };

  const renderDate = (date: any) => {
    const diff = now.diff(date);
    const duration = moment.duration(diff);
    const hour = duration.asHours();
    const year = duration.asYears();
    if (hour < 24) {
      return moment(date).format('HH:mm');
    }
    if (year < 1) {
      return moment(date).format('HH:mm DD/MM');
    }
    return moment(date).format('HH:mm DD/MM/YY');
  };
  return (
    <>
      {/* <!-- Chat Content Start--> */}
      <div className="container" style={{ paddingBottom: 70 }}>
        {/* <!-- Message Day Start --> */}
        <div className="message-day">
          {items?.map((message: any, index: number) => (
            <div className={authUser._id === message.senderId ? 'message self' : 'message'} key={index as any}>
              <div className="message-wrapper">
                <div className={`message-content + ${message.type === 'text' && 'bg-primary-custom'}`}>
                  {message.type === 'text' && <span>{message.text}</span>}
                  {(message.type === 'photo' || message.type === 'video') && message.files && (
                  <MediaContent messageLength={items.length} sender={message.sender} type={message.type} items={message.files} download />
                  )}
                  {message.type === 'file' && message.files && (
                  <div className="document">
                    <div className="btn btn-primary btn-icon rounded-circle text-light mr-2">
                      <svg className="hw-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    <div className="document-body">
                      <h6>
                        <a href="#" onClick={() => handleDownloadFile(message?.fileIds[0])} className="text-reset">
                          {message?.files[0]?.name}
                        </a>
                      </h6>

                      <ul className="list-inline small mb-0">
                        <li className="list-inline-item">
                          <span className="text-muted">
                            {Number(message?.files[0]?.size) / 1000}
                            {' '}
                            KB
                          </span>
                        </li>
                        <li className="list-inline-item">
                          <span className="text-muted text-uppercase">
                            {message?.files[0]?.mimeType.substring(message?.files[0]?.mimeType.indexOf('/') as any + 1)}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  )}
                </div>
                {/* {authUser._id === message.senderId && ( */}
                {authUser.type === 'user' && (
                  message.bookmarked
                    ? (
                      <a
                        aria-hidden
                        className="nav-link text-muted p-0 hw-20 mr-2"
                        role="button"
                        title="Details"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        onClick={(e) => handleRemoveBookmarkedMessage(e, message.bookmarkId, message._id)}
                      >
                        <i className="text-primary fas fa-thin fa-star " />
                      </a>
                    )
                    : (
                      <a
                        aria-hidden
                        className="nav-link text-muted p-0 message-menu hw-20 mr-2 mt-1"
                        role="button"
                        title="Details"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        onClick={(e) => handleAddBookmarkedMessage(e, message._id)}
                      >
                        <i className="fas fa-thin fa-star " />
                      </a>
                    )
                )}
                <a
                  aria-hidden
                  className="nav-link text-muted p-0 message-menu hw-20 mr-1"
                  role="button"
                  title="Details"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  onClick={(e) => handleRemoveMessage(e, message._id)}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </a>

                {/* )} */}
              </div>
              <div className="message-options">
                {authUser._id !== message.senderId && (
                <div className="avatar avatar-sm">
                  <img alt="" src={message.sender.avatarUrl || '/images/user1.jpg'} 
                   onError={(e) => e.currentTarget.src = 'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'}
                   />
                </div>
                )}
                <span className="message-date">{renderDate(message.createdAt)}</span>
              </div>

            </div>
          ))}
        </div>
        {/* <!-- Message Day End --> */}
      </div>
      {/* <!-- Chat Content End--> */}
    </>
  );
}

export default connector(ChatContent);
