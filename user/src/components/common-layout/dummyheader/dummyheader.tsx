
import { useState } from 'react';
import {  Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { mailService } from 'src/services';
import {
  Button
} from 'react-bootstrap';
import { log } from 'console';
import { useTranslationContext } from 'context/TranslationContext';
function Header( { onByCoinsClick ,isAuthUserTrue ,onByfavoriteClick ,onBymodelsClick ,onByconversationClick ,inviteClick  }) {
  const [activeRoute, setActiveRoute] = useState(null);

  const handleshowloginpage =()=>{
    window.location.href = '/auth/login';
  }

  const [open, setOpen] = useState<boolean>(false);
  const [emails, setEmails] = useState<string>("");
  const {t, lang} = useTranslationContext();



  const handlesendemailinvite = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (isAuthUserTrue) {
      e.preventDefault();

      if (emails.trim() !== "") {
        try {
          await mailService.inviteUser({ emails });
          toast.success('Einladungsmail wurde versendet.');
          setEmails("");
          setOpen(false);
        } catch (error) {
          console.error(error);
          toast.error('Fehler beim Versenden der Einladungsmail.');
        }
      } else {
        toast.error('Bitte geben Sie eine E-Mail-Adresse ein, um die Einladung zu senden.');
      }
    } else {
      toast.error('Sie sind kein autorisierter Benutzer, bitte melden Sie sich bei Ihrem Konto an', { autoClose: 3000 }); // Toast will auto-close after 3 seconds
      setTimeout(() => {
        inviteClick(true);
        setOpen(false);
      }, 3000); 
    }
  };



  


  const openModal = () => {
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
  };
  
  const handleByCoinsClick = () => {
    if (onByCoinsClick) {
      onByCoinsClick(true);
    }
  };
  const handleByfavoriteClick = () => {
    if (onByfavoriteClick) {
      onByfavoriteClick(true);
    }
  };
  const handleBymodelsClick = () => {
    if (onBymodelsClick) {
      onBymodelsClick(true);
    }
  };
  const handleconversationClick = () => {
    if (onByconversationClick) {
      onByconversationClick(true);
    }
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light top-nav navbar-menu-mobile">
      <a aria-hidden className={`navbar-brand ${activeRoute === 'models' && 'active'}`} href="/models">
        <img alt="img_logo_header" src="/images/logo_0.png" />
      </a>
      <div className="navbar-menu">
        <div className="collapse navbar-collapse show" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item" data-toggle="tooltip" title={t?.header?.chat}>
              <Button
     onClick={handleconversationClick}
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
            
            </li>
            {/* <li className="nav-item">
              <a aria-hidden className="nav-link" onClick={handleByCoinsClick}>
                <i className="fa fa-heart" />
                {' '}
                <span className="hide-mobile">Gleichgewicht</span>
              </a>
            </li> */}
            <li className="nav-item">
              <a aria-hidden className="nav-link" onClick={handleBymodelsClick}>
                <i className="fa fa-users" />
                {' '}
                <span className="hide-mobile">{t?.header?.models}</span>
              </a>
            </li>
            <li className="nav-item">
              <a aria-hidden className="nav-link"onClick={handleByfavoriteClick}>
                <i className="far fa-heart" />
                {' '}
                <span className="hide-mobile">{t?.header?.favorites}</span>
              </a>
            </li>
            <li className="nav-item">
              <a aria-hidden className="nav-link" onClick={openModal}>
                <i className="fas fa-user-plus" />
                {' '}
                <span className="hide-mobile">{t?.header?.invite}</span>
              </a>
            </li>

           {isAuthUserTrue ? (
             null
            ) : (
                 <li className="nav-item">
                   <a aria-hidden className="nav-link" href="/auth/login">
                      <i className="far fa-sign-in" />
                     <span className="hide-mobile" style={{paddingLeft:"7px"}}>{t?.header?.login}</span>
                  </a>
                 </li>
                )}
          </ul>
        </div>
      </div>

      <Modal
      dialogClassName="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom"
      aria-labelledby="contained-modal-title-vcenter"
      show={open}
      onHide={closeModal}
      className="modal modal-lg-fullscreen fade"
    >
      <Modal.Header>
        <h5 className="modal-title" id="inviteUsersLabel">
          {lang === "en" ? "Invite Users" : "Benutzer einladen"}
        </h5>
        <Button className="fa fa-xmark" type="button" aria-label="Close" onClick={closeModal} />
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="row">
            <div className="col-12">
              <div className="form-group">
                <label>{lang === "en" ? "Email" : "E-Mail"}</label>
                <input
                  type="text"
                  className="form-control form-control-md h-100"
                  placeholder={lang === "en" ? "Enter email address here"  : "Bitte geben Sie hier Ihre E-Mail-Adresse ein"}
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                />
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="btn btn-link text-muted"
          onClick={closeModal}
        >
          {lang === 'en' ? "Cancel" : 'Schließen'}
        </button>
        <button type="button" className="btn btn-primary" onClick={handlesendemailinvite}>
          {lang === 'en' ? "Send Invite": "Einladung versenden"}
        </button>
      </Modal.Footer>
    </Modal>
    </nav>
  );
}

export default Header;
