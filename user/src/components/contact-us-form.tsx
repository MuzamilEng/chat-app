import { useTranslationContext } from 'context/TranslationContext';
import { Formik } from 'formik';
import {
  useEffect, useRef, useState
} from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Row
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { userService } from 'src/services';
import * as Yup from 'yup';

function ContactUsForm() {
  const [submitting, setSubmitting] = useState(false);
  const [countTime, setCountTime] = useState(0);
  const {t, lang} = useTranslationContext()

  const _intervalCountdown = useRef(null);
  const schema = Yup.object().shape({
    name: Yup.string().required( lang === 'en' ? 'Name is required' : 'Name wird benötigt'),
    email: Yup.string()
      .email( lang === 'en' ? 'E-Mail-Format is not correct' : 'E-Mail-Format ist nicht korrekt')
      .required( lang === 'en' ? 'E-Mail is required' : 'E-Mail wird benötigt')
  });
  
  const coundown = () => {
    setCountTime(countTime - 1);
  };

  const handleCountdown = () => {
    if (countTime === 0) {
      clearInterval(_intervalCountdown.current);
      return;
    }

    setCountTime(countTime - 1);
    _intervalCountdown.current = setInterval(coundown, 1000);
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      await userService.contactAdmin(values);
      toast.success('Vielen Dank für Ihre Kontaktaufnahme. Wir werden innerhalb von 48 Stunden antworten.');
      setCountTime(60);
      handleCountdown();
    } catch (e) {
      toast.error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => () => {
    if (_intervalCountdown.current) clearInterval(_intervalCountdown.current);
  }, []);

  return (
    <Row className="justify-content-center">
      <Col sm={12} md={6} lg={6} xl={4}>
        <Card>
          <Card.Body>
            <Card.Title className="font-weight-semibold text-center" style={{ fontSize: ' 1.5rem' }}>
            {t?.contact?.title}
            </Card.Title>
            <Card.Subtitle className="text-center text-muted" style={{ fontSize: 13 }}>
              {t?.contact?.description}
            </Card.Subtitle>
          </Card.Body>
          <Formik
            validationSchema={schema}
            initialValues={{ name: '', email: '', message: '' }}
            onSubmit={onFinish}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit
            }) => (
              <Form onSubmit={handleSubmit}>
                <Card.Body as={Row}>
                  <Form.Group as={Col} md={12} xs={12}>
                    <Form.Label>{t?.contact?.name}</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      id="name"
                      placeholder={lang === 'en' ? 'Please enter your name' : 'Bitte geben Sie Ihren Namen ein'}
                      isInvalid={touched.name && !!errors.name}
                      className="form-control"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.name}
                    />
                    <Form.Control.Feedback className="invalid-feedback">{errors.name as any}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md={12} xs={12}>
                    <Form.Label>{t?.contact?.email}</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      id="email"
                      placeholder={lang === 'en' ? 'Please enter your email' : 'Bitte geben Sie Ihre E-Mail Adresse ein'}
                      isInvalid={touched.email && !!errors.email}
                      className="form-control"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                    />
                    <Form.Control.Feedback className="invalid-feedback">{errors.email as any}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md={12} xs={12}>
                    <Form.Label>{t?.contact?.message}</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="message"
                      id="message"
                      className="form-control"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.message}
                    />
                    <Form.Control.Feedback className="invalid-feedback">{errors.message as any}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md={12} xs={12} className="text-center">
                    <Button
                      className="btn btn-primary"
                      type="submit"
                      disabled={submitting || countTime > 0}
                    >
                      {t?.contact?.submit}
                    </Button>
                  </Form.Group>
                </Card.Body>
              </Form>
            )}
          </Formik>
        </Card>
      </Col>
    </Row>
  );
}

export default ContactUsForm;
