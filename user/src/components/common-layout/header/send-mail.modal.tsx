/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useTranslationContext } from 'context/TranslationContext';
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { isEmail, ReactMultiEmail } from 'react-multi-email';
import { toast } from 'react-toastify';
import { mailService } from 'src/services';

function SendMailModal({ state, setState }: any) {
  const [emails, setEmails] = useState([]);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const {t, lang} = useTranslationContext();

  const sendInvite = async (e: any) => {
    e.preventDefault();

    if (emails.length) {
      try {
        await mailService.inviteUser({ emails });
        toast.success('Einladungsmail wurde versendet.');
        setState(false);
        setEmails([]);
      } catch {
        toast.error('Fehler');
      }
    } else {
      toast.error('Bitte geben Sie die E-Mail-Adresse ein, um die Einladung zu senden!');
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
          <Button className="fa fa-xmark" type="button" aria-label="Close" onClick={setState} />
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label>{lang === 'en' ? 'Email' : 'E-Mail-Adresse'}</label>
                  <ReactMultiEmail
                    className="form-control form-control-md h-100"
                    placeholder={lang === 'en' ? 'Enter the email address here' : 'Bitte geben Sie hier Ihre E-Mail-Adresse ein'}
                    emails={emails}
                    onChange={(_emails: any) => setEmails(_emails)}
                    validateEmail={(email) => {
                      setIsValidEmail(isEmail(email));
                      return isEmail(email);
                    }}
                    getLabel={(email: string, index: number, removeEmail: (i: number) => void) => (
                      <div data-tag key={email}>
                        {email}
                        <span data-tag-handle onClick={() => removeEmail(index)}>&#215;</span>
                      </div>
                    )}
                  />
                  {!isValidEmail && (
                    <div className="invalid-feedback" style={{ display: 'block' }}>
                      E-Mail ist erforderlich
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
          <button type="button" className="btn btn-primary" onClick={(e) => sendInvite(e)}>
          {lang === 'en' ? 'Send Invite' : 'Einladung versenden'}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SendMailModal;
