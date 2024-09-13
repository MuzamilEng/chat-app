import ChatButton from '@components/conversation/chat-button';
import { contactService } from '@services/contact.service';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';

// Action
import SendTipButton from '../send-tip-button';
import Link from 'next/link';
import { useTranslationContext } from 'context/TranslationContext';

interface IProps {
  contact: any;
}



function ContactHeader({
  contact
}: IProps) {
  const router = useRouter();
  const {setModelId, lang} = useTranslationContext();


  // const isFriend = React.useRef<boolean>(contact.isFriend);
  const [isFriend, setIsFriend] = useState(contact?.isFriend);
  const removeContact = async () => {
    try {
      // TODO - prevent click too many times
      await contactService.remove(contact?._id);
      setIsFriend(false);
      toast.success(`${contact?.username} wurde aus Ihrer Favoritenliste entfernt!`);
    } catch (e) {
      const err = await e;
      toast.error(err.msg || 'Ein Fehler ist aufgetreten, bitte versuchen Sie es später erneut!');
    }
  };

  const addContact = async () => {
      try {
        await contactService.add({
          userId: contact._id
        });
        setIsFriend(true);
        toast.success(`${contact?.username} wurde Ihrer Favoritenliste hinzugefügt!`);
      } catch (e) {
        const err = await e;
        toast.error(err?.data?.message || 'Ein Fehler ist aufgetreten, bitte versuchen Sie es später erneut!');
      }
    
  };

  return (
    <div className="row">
      <div className="col">
        <div className="card card-body card-bg-1 mb-3 contact-detail">
          <div className="d-flex flex-column align-items-center">
            <div className="friend-status position-absolute right-20">
              <div className="">
                {isFriend
                  ? (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                    <i
                      className="fas fa-heart filled"
                      onClick={() => removeContact()}
                    />
                  )
                  : (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                    <i
                      className="far fa-heart"
                      onClick={() => addContact()}
                    />
                  )}
              </div>
            </div>
            <div className="avatar avatar-lg mb-3">
              <img className="avatar-img" src={contact?.avatarUrl || contact?.user?.avatarUrl || '/images/user1.jpg'} alt=""
               onError={(e) => (e.currentTarget.src = "https://img.freepik.com/premium-photo/3d-bohemian-styled-woman_397139-28113.jpg?size=626&ext=jpg")}
                        />
            </div>

            <div className="d-flex flex-column align-items-center">
              <h5 className="mb-1">{contact?.username || contact?.user?.username}</h5>
              <div className="text-center" onClick={() => router.push(`/${lang}/auth/login`)} >
                { <SendTipButton model={contact} />}
                <ChatButton isFriend={isFriend} user={contact} />
                { <Link className="btn btn-primary btn-sm" href={`/${lang}/auth/login`}>Blogs</Link>}
              </div>
              <div>
                (
                {contact?.tokenPerMessage}
                {' '}
                {contact?.tokenPerMessage === 1 ? 'token' : 'tokens'}
                {' '}
                {lang === 'de' ? 'pro Nachricht' : 'per message'})
              </div>
            </div>
          </div>

          <div className="chat-closer d-xl-none">
            <button
              className="btn btn-secondary btn-icon btn-minimal btn-sm text-muted"
              type="button"
              data-close=""
              onClick={() => router.push(`/${lang}/auth/login`)}
            >
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
        </div>
      </div>
    </div>
  );
}

export default ContactHeader;
