import { authService } from '@services/auth.service';
import { useTranslationContext } from 'context/TranslationContext';
import { Formik, FormikProps } from 'formik';
import { Button, Form, FormControl } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

interface FormValues {
  token: any;
}

const schema = Yup.object().shape({
  token: Yup.number().min(1).required('Token is required')
});

const mapStates = (state: any) => ({
  authUser: state.auth.authUser
});

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;
function TokenPerMessageForm({ authUser }: PropsFromRedux) {
  const { t, lang } = useTranslationContext();
  const updateToken = async (values) => {
    try {
      await authService.updateTokenPerMessage(values);
      toast.success( lang === 'en' ? 'Settings updated successfully' : 'Ihre Einstellungen wurden aktualisiert!');
    } catch (e) {
      const err = await e;
      toast.error(err?.message || err?.msg || lang === 'en' ? 'Something went wrong. Please try again!' : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut!');
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-header">{lang === 'en' ? 'Token Per Message' : 'Token pro Nachricht'}</div>
      <Formik
        validationSchema={schema}
        initialValues={{ token: authUser?.tokenPerMessage || 1 }}
        onSubmit={(values: FormValues) => updateToken(values)}
      >
        {(props: FormikProps<FormValues>) => (
          <form onSubmit={props.handleSubmit}>
            <div className="card-body card-bg-1">
              <Form.Group>
                <FormControl
                  isInvalid={props.touched.token && !!props.errors.token}
                  name="token"
                  className="input-type mw-300"
                  type="number"
                  min={1}
                  step={0.01}
                  placeholder="Bitte geben Sie die Tokens pro Nachricht ein."
                  onChange={props.handleChange}
                  value={props.values.token}
                />
                <div className="invalid-feedback">{props.errors.token as any}</div>
              </Form.Group>
            </div>
            <div className="card-footer d-flex justify-content-end">
              <Button variant="primary" type="submit">
             {lang === 'en' ? 'Save Changes' : ' Änderungen speichern'}
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}

export default connector(TokenPerMessageForm);
