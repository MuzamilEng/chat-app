import { useTranslationContext } from 'context/TranslationContext';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import {
  Button, Form, FormControl, Modal
} from 'react-bootstrap';
import * as Yup from 'yup';

interface FormValues {
  token: string;
}
const schema = Yup.object().shape({
  token: Yup.number().positive().required('Token is Required')
});

function ShareLoveModal({
  show,
  modelId,
  onShare,
  onCancel = () => { }
}: any) {

  const {lang} = useTranslationContext()
  return (
    <Modal
      dialogClassName="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom"
      aria-labelledby="contained-modal-title-vcenter"
      show={show}
      className="modal modal-lg-fullscreen fade"
    >
      <Modal.Header>
        <h5 className="modal-title" id="inviteUsersLabel">
        {lang === "en" ? 'Share a Tip' : 'Teilen Sie einen Tipp'}
        </h5>
        <Button type="button" aria-label="Close" onClick={onCancel}>
          <i className="fa fa-xmark " />
        </Button>
      </Modal.Header>
      <Formik
        validationSchema={schema}
        onSubmit={(values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
          onShare(Object.assign(values, { modelId }));
          formikHelpers.setSubmitting(false);
          formikHelpers.resetForm();
        }}
        initialValues={{ token: '0' }}
        render={(props: FormikProps<FormValues>) => (
          <form onSubmit={props.handleSubmit}>
            <Modal.Body>
              <div className="row">
                <div className="col-12">
                  <Form.Group>
                    <Form.Label>Token</Form.Label>
                    <FormControl
                      className="input-type"
                      isInvalid={props.touched.token && !!props.errors.token}
                      type="number"
                      min={1}
                      step={1}
                      name="token"
                      id="token"
                      placeholder="Bitte geben Sie die Anzahl der Token ein."
                      onChange={props.handleChange}
                      value={props.values.token}
                    />
                    <div className="invalid-feedback">{props.errors.token}</div>
                  </Form.Group>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                className="btn btn-link text-muted"
                data-dismiss="modal"
                onClick={onCancel}
              >
                Close
              </button>
              <Button type="submit" className="btn btn-primary">
              {lang === "en" ? 'Share a Tip' : "Teilen Sie einen Tipp"}
              </Button>
            </Modal.Footer>
          </form>
        )}
      />
    </Modal>
  );
}

export default ShareLoveModal;
