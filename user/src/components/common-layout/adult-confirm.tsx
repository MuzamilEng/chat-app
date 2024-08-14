/* eslint-disable react/no-danger */
import { useTranslationContext } from "context/TranslationContext";
import cookie from "js-cookie";
import getConfig from "next/config";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

function AdultConfirmModal() {
  const [show, setShow] = useState(false);
  const { t } = useTranslationContext();

  const confirm = () => {
    cookie.set("confirmAdult", "1", { expires: 365 });
    setShow(false);
  };

  const leave = () => {
    window.location.replace("https://www.google.com/");
  };

  const { publicRuntimeConfig: config } = getConfig();
  const htmlContent = `
  <p>
    ${t?.adultConfirmModal?.content?.intro} <a href="girls2dream.com">girls2dream.com</a> <br>
    ${t?.adultConfirmModal?.content?.important} <br>
    ${t?.adultConfirmModal?.content?.details?.profileContent} <br>
    ${t?.adultConfirmModal?.content?.details?.playerFunctionality} <br>
    ${t?.adultConfirmModal?.content?.details?.paymentProcessor} <br>
    ${t?.adultConfirmModal?.content?.details?.etc} <br>
    ${t?.adultConfirmModal?.content?.details?.dependent}
  </p>
  <p>
    ${t?.adultConfirmModal?.content?.warning}
  </p>
  <p>
    ${t?.adultConfirmModal?.content?.confirmation}
  </p>
  <ul>
    <li>${t?.adultConfirmModal?.content?.points?.ageOfMajority}</li>
    <li>${t?.adultConfirmModal?.content?.points?.personalUse}</li>
    <li>${t?.adultConfirmModal?.content?.points?.wishToView}</li>
    <li>${t?.adultConfirmModal?.content?.points?.constitutionalRight}</li>
    <li>${t?.adultConfirmModal?.content?.points?.noOffense}</li>
    <li>${t?.adultConfirmModal?.content?.points?.noViolation}</li>
    <li>${t?.adultConfirmModal?.content?.points?.responsibility}</li>
    <li>${t?.adultConfirmModal?.content?.points?.termsAcceptance}</li>
    <li>${t?.adultConfirmModal?.content?.points?.jurisdiction}</li>
    <li>${t?.adultConfirmModal?.content?.points?.legallyBinding}</li>
    <li>${t?.adultConfirmModal?.content?.points?.performers}</li>
    <li>${t?.adultConfirmModal?.content?.points?.intendedUse}</li>
    <li>${t?.adultConfirmModal?.content?.points?.falseStatement}</li>
    <li>${t?.adultConfirmModal?.content?.points?.eSignAct}</li>
  </ul>
  `;

  useEffect(() => {
    const hasConfirm = cookie.get("confirmAdult");
    if (!hasConfirm) setShow(true);
  }, []);

  return (
    <Modal
      className="modal-adult"
      aria-labelledby="contained-modal-title-vcenter"
      show={show}
    >
      <Modal.Header style={{marginTop: "1vw"}}>
        {t?.adultConfirmModal?.title}
      </Modal.Header>
      <Modal.Body>
        <div>
          <div
            className="scroll"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          <p className="notice-txt">
            {t?.adultConfirmModal?.notice}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={confirm}
          className="form-control btn btn-primary"
        >
          {t?.adultConfirmModal?.content?.buttons?.confirm}
        </button>
        <button
          type="button"
          onClick={leave}
          className="form-control btn btn-default"
        >
          {t?.adultConfirmModal?.content?.buttons?.leave}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default AdultConfirmModal;