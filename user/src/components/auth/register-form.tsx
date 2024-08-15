import { useTranslationContext } from 'context/TranslationContext';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Form, FormControl } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { authService } from 'src/services/auth.service';
import * as Yup from 'yup';

const Loader = dynamic(() => import('src/components/common-layout/loader/loader'), { ssr: false });
const ShowPasswordIcon = dynamic(() => import('src/components/common-layout/show-password-icon'), { ssr: false });

interface FormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAgreeToS: boolean;
}

const validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const schema = Yup.object().shape({
  username: Yup.string().required('Benutzername ist erforderlich'),
  email: Yup.string().email('E-Mail-Format ist nicht korrekt').required('E-Mail wird benötigt'),
  password: Yup.string()
    .required('Passwort wird benötigt')
    .matches(
      validatePassword,
      'Passwort muss mindestens 8 Zeichen lang sein, mindestens 1 Zahl, 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Sonderzeichen enthalten'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwortbestätigung stimmt nicht mit Passwort überein')
    .required('Passwortbestätigung wird benötigt'),
  isAgreeToS: Yup.boolean().default(false)
});

function RegisterForm() {
  const [showPw, setShowPw] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [type, setType] = useState('user');
  const { t, lang } = useTranslationContext();

  const register = async (data: any) => {
    const {
      username, email, password, confirmPassword, isAgreeToS
    } = data;
    if (!isAgreeToS) {
      toast.error('Bitte bestätigen Sie, ob Sie unseren Geschäftsbedingungen zustimmen.');

    } else if (confirmPassword !== password) {
      toast.error('Passwortbestätigung ist falsch.');
    } else {
      await authService
        .register({
          username, email, password, type
        })
        .then((resp) => {
          toast.success(resp?.data?.data?.message || 'Registrierung erfolgreich!');
          setTimeout(() => {
            window.location.href = `/${lang}/auth/login`;
          }, 1000);
        })
        .catch(async (e) => {
          const error = await Promise.resolve(e);
          toast.error(error?.data?.message || 'Etwas ist schiefgelaufen!');
        });
    }
    setRequesting(false);
  };

  return (
    <Formik
      validationSchema={schema}
      initialValues={{
        username: '', email: '', password: '', confirmPassword: '', isAgreeToS: false
      }}
      onSubmit={(values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
        setRequesting(true);
        register(values);
        formikHelpers.setSubmitting(false);
      }}
    >
      {(props: FormikProps<FormValues>) => (
        <form onSubmit={props.handleSubmit}>
          <Form.Group className="form-group">
            <Form.Label className="input-label">{lang === 'de' ? 'Benutzername' : 'Username'}</Form.Label>
            <FormControl
              isInvalid={props.touched.username && !!props.errors.username}
              name="username"
              className="form-control"
              type="text"
              id="username"
              placeholder={lang === 'de' ? 'Benutzername' : 'Username'}
              onChange={props.handleChange}
              onBlur={props.handleBlur}
              value={props.values.username}
            />
            <div className="invalid-feedback">{props.errors.username}</div>
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label className="input-label">{lang === 'de' ? 'E-Mail-Adresse' : 'Email-Adress'}</Form.Label>
            <FormControl
              isInvalid={props.touched.email && !!props.errors.email}
              name="email"
              className="form-control"
              type="text"
              id="email"
              placeholder="user@example.com"
              onChange={props.handleChange}
              onBlur={props.handleBlur}
              value={props.values.email}
            />
            <div className="invalid-feedback">{props.errors.email}</div>
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label className="input-label">{lang === 'de' ? 'Passwort' : 'Password' }</Form.Label>
            <FormControl
              isInvalid={props.touched.password && !!props.errors.password}
              name="password"
              className="form-control"
              type={showPw ? 'text' : 'password'}
              id="password"
              placeholder="********"
              onChange={props.handleChange}
              onBlur={props.handleBlur}
              value={props.values.password}
            />
            <div className="invalid-feedback">{props.errors.password}</div>
            <ShowPasswordIcon
              handleClick={setShowPw}
              showPw={showPw}
              error={props.errors.password}
            />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label className="input-label">{lang === 'de' ? 'Passwort bestätigung' : 'Confirm Password' }</Form.Label>
            <FormControl
              isInvalid={props.touched.confirmPassword && !!props.errors.confirmPassword}
              name="confirmPassword"
              className="form-control"
              type={isShowConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="********"
              onChange={props.handleChange}
              onBlur={props.handleBlur}
              value={props.values.confirmPassword}
            />
            <div className="invalid-feedback">{props.errors.confirmPassword}</div>
            <ShowPasswordIcon
              handleClick={setIsShowConfirmPassword}
              showPw={isShowConfirmPassword}
              error={props.errors.confirmPassword}
            />
          </Form.Group>
          <Form.Group className="mb-10 form-group">
            <Form.Check
              type="radio"
              onChange={() => setType('user')}
              value="user"
              defaultChecked
              name="type"
              id="user"
              inline
              label={lang === 'de' ? 'Benutzer' : 'User'}
            />
            <Form.Check
              type="radio"
              onChange={() => setType('model')}
              value="model"
              name="type"
              id="model"
              inline
              label={lang === 'de' ? 'Modell' : 'Model'}
            />
          </Form.Group>
          <Form.Group className="mb-10 form-group">
            <Form.Check
              type="checkbox"
              id="isAgreeToS"
              name="isAgreeToS"
              label={(
                <>
                {/* /posts/terms-and-conditions   link commented by muzi*/}
                  {lang === 'de' ? 'Ich stimme den' : 'I agree to the terms and conditions'}
                  {/*  <a href="#">Geschäftsbedingungen</a> zu */} commented by muzi
                </>
              )}
              checked={props.values.isAgreeToS}
              onChange={props.handleChange}
              onBlur={props.handleBlur}
            />
          </Form.Group>
          <Form.Group className="form-group">
            <button type="submit" className="xchat-btn-fill" disabled={requesting}>
              {requesting ? <Loader /> : 'Register'}
            </button>
          </Form.Group>
        </form>
      )}
    </Formik>
  );
}

export default RegisterForm;
