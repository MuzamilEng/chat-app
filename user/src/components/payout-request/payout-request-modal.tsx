import { useTranslationContext } from 'context/TranslationContext';
import { Formik, FormikProps } from 'formik';
import { useEffect, useState } from 'react';
import {
  Button, Form, FormControl, Modal
} from 'react-bootstrap';
import OtpInput from 'react-otp-input';
import { connect, ConnectedProps, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { sendPayoutRequest } from 'src/redux/payout-request/actions';
import { payoutAccountAccount, userService } from 'src/services';
import * as Yup from 'yup';

interface IProps {
  isShowModal: boolean;
  onCloseModal: Function;
}

interface FormValues {
  token: number;
}

const mapStateToProps = (state: any) => ({
  authUser: state.auth.authUser,
  config: state.system.config
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

function PayoutRequestModal({
  isShowModal,
  onCloseModal,
  authUser,
  config
}: IProps & PropsFromRedux) {
  const [verifyCode, setVerifyCode] = useState('');
  const [payoutAccount, setpayoutAccount] = useState(null);
  const [OTPForm, isOTPForm] = useState(false);
  const [token, setToken] = useState(0);
  const { t, lang } = useTranslationContext();

  const distpatch = useDispatch();

  const schema = Yup.object().shape({
    token: Yup.number()
      .min(config?.minPayoutRequest || 1)
      .max(authUser?.balance)
      .required()
  });

  const loadPayoutAccount = async () => {
    try {
      const resp = await payoutAccountAccount.find();
      setpayoutAccount(resp.data.bankInfo);
    } catch (e) {
      const err = await e;
      toast.error(err?.message ||  lang === 'en' ? 'Failed to load payout account' : ' Das Laden des Auszahlungskontos ist fehlgeschlagen');
    }
  };

  useEffect(() => {
    if (verifyCode && verifyCode.toString().length === 4) {
      distpatch(sendPayoutRequest({ token, email: authUser?.email, verifyCode }));
      setVerifyCode('');
    }
  }, [verifyCode]);

  useEffect(() => {
    loadPayoutAccount();
  }, []);

  useEffect(() => {
    if (!isShowModal) {
      isOTPForm(false);
    }
  }, [isShowModal]);

  const onChangeValue = (value: any) => {
    if (!/^[0-9_-]*$/.test(value)) {
      toast.error(lang === 'en' ? 'Please enter only numeric characters' : 'Bitte geben Sie nur numerische Zeichen ein');
    }
    setVerifyCode(value);
  };

  const getOTP = async (data: number) => {
    if (!payoutAccount) {
      toast.error( lang === 'en' ? 'Please enter payout account information' : 'Bitte geben Sie die Auszahlungskontoinformationen ein!');
    } else {
      await userService.getOTP().then(() => {
        setToken(data);
        isOTPForm(true);
        toast.success( lang === 'en' ? 'Verification code sent!' : 'Bestätigungscode wurde gesendet!');
      });
    }
  };

  return (
    <Modal
      dialogClassName="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom"
      aria-labelledby="contained-modal-title-vcenter"
      className="modal modal-lg-fullscreen fade modal-uploader"
      size="lg"
      show={isShowModal}
      // onHide={() => onCloseModal()}
    >
      <Modal.Header>
        <h5 className="modal-title">{lang === 'en' ? 'Send payout request' : 'Senden Sie eine Auszahlungsanfrage'}</h5>
        <Button className="fa fa-xmark" type="button" aria-label="Close" onClick={() => onCloseModal()} />
      </Modal.Header>
      <Formik
        enableReinitialize
        onSubmit={(values: FormValues) => getOTP(values.token)}
        initialValues={{ token: 0 }}
        validationSchema={schema}
        render={(props: FormikProps<FormValues>) => (
          <form onSubmit={props.handleSubmit}>
            <Modal.Body>
              <div className="row">
                <div className="col-md-6 col-12">
                  <Form.Group>
                    <Form.Label>Tokens</Form.Label>
                    <FormControl
                      placeholder={lang === 'en' ? 'Enter number of tokens' : `Mindestauszahlungsanforderung ${config?.minPayoutRequest || 1}, Verfügbare Tokens für Auszahlung ${authUser?.balance
                      }`}
                      className="input-type"
                      name="token"
                      value={props.values.token}
                      onChange={props.handleChange}
                      isInvalid={!!props.errors.token && props.touched.token}
                    />
                    <div className="invalid-feedback">{props.errors.token}</div>
                    <small className="text-muted">
                      {`Mindestauszahlungsanforderung ${config?.minPayoutRequest || 1}`}
                      <br />
                      {`Verfügbare Tokens für Auszahlung ${authUser?.balance}`}
                    </small>
                  </Form.Group>
                </div>
                {OTPForm && (
                <div className="col-md-6 col-12">
                  <Form.Group>
                    <Form.Label>{lang === 'en' ? ' OTP sent to your email address please enter it below ' : 'Die OTP wurde an Ihre E-Mail gesendet. Bitte geben Sie sie unten ein'}.</Form.Label>
                    <OtpInput
                    containerStyle="otp-container-custom"
                    inputStyle="otp-mini-custom"
                    onChange={onChangeValue}
                    numInputs={6}
                    value={verifyCode}
                    shouldAutoFocus={true}
                    renderInput={(props) => <input {...props} />}
                  />
                  </Form.Group>
                </div>
                )}
                {' '}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button type="submit" variant="primary">
              {lang === 'en' ? 'Submit' : 'Absenden'}
              </Button>
            </Modal.Footer>
          </form>
        )}
      />
    </Modal>
  );
}

export default connector(PayoutRequestModal);
