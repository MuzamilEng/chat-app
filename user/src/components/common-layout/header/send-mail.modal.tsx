/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useTranslationContext } from 'context/TranslationContext';
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { isEmail } from 'react-multi-email';
import { toast } from 'react-toastify';
import { mailService } from 'src/services';

function SendMailModal({ state, setState }: any) {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const { t, lang } = useTranslationContext();

  const sendInvite = async (e: any) => {
    e.preventDefault();

    if (email) {
      if (!isEmail(email)) {
        setIsValidEmail(false);
        toast.error(lang === 'en' ? 'Invalid email address.' : 'Ungültige E-Mail-Adresse.');
        return;
      }

      try {
        await mailService.inviteUser({ emails: email }); // Sending the email as an array with one element
        toast.success(lang === 'en' ? 'Invitation sent.' : 'Einladungsmail wurde versendet.');
        setState(false);
        setEmail(''); // Clear the input
      } catch {
        toast.error('Fehler');
      }
    } else {
      toast.error(lang === 'en' ? 'Please enter the email address.' : 'Bitte geben Sie die E-Mail-Adresse ein, um die Einladung zu senden!');
    }
  };

  return (
    <>
      {/* <!-- Invite User Modal --> */}
      <Modal
        dialogClassName="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom"
        aria-labelledby="contained-modal-title-vcenter"
        show={state}
        onHide={() => setState(false)}
        className="modal modal-lg-fullscreen fade"
      >
        <Modal.Header>
          <h5 className="modal-title" id="inviteUsersLabel">
            {lang === 'en' ? 'Invite User' : 'Benutzer einladen'}
          </h5>
          <Button className="fa fa-xmark" type="button" aria-label="Close" onClick={() => setState(false)} />
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label>{lang === 'en' ? 'Email' : 'E-Mail-Adresse'}</label>
                  <input
                    type="email"
                    className={`form-control form-control-md h-100 ${!isValidEmail ? 'is-invalid' : ''}`}
                    placeholder={lang === 'en' ? 'Enter the email address here' : 'Bitte geben Sie hier Ihre E-Mail-Adresse ein'}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsValidEmail(true); // Reset the error message when the user starts typing
                    }}
                  />
                  {!isValidEmail && (
                    <div className="invalid-feedback" style={{ display: 'block' }}>
                      {lang === 'en' ? 'Invalid email address.' : 'Ungültige E-Mail-Adresse.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-link text-muted"
            data-dismiss="modal"
            onClick={() => setState(false)}
          >
            {lang === 'en' ? 'Close' : 'Schließen'}
          </button>
          <button type="button" className="btn btn-primary" onClick={sendInvite}>
            {lang === 'en' ? 'Send Invite' : 'Einladung versenden'}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SendMailModal;
