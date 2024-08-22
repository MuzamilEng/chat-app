import { showError } from '@lib/utils';
import { useTranslationContext } from 'context/TranslationContext';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Form, FormControl } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';
import { toast } from 'react-toastify';
import { setLogin } from 'src/redux/auth/actions';
import { authService } from 'src/services/auth.service';
import * as Yup from 'yup';

const Loader = dynamic(() => import('src/components/common-layout/loader/loader'));
const ShowPasswordIcon = dynamic(() => import('src/components/common-layout/show-password-icon'));

interface FormValues {
  email: string;
  password: string;
  isKeepLogin: boolean;
}

const validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


const mapDispatch = {
  dispatchSetLogin: setLogin
};

const connector = connect(null, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

function LoginForm({
  dispatchSetLogin
}: PropsFromRedux) {
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();
  const { t , lang} = useTranslationContext();

  const schema = Yup.object().shape({
    email: Yup.string().email( lang === 'en' ? 'Email is not valid' : 'E-Mail-Format ist nicht korrekt').required( lang === 'en' ? 'Email is required' : 'E-Mail wird benötigt'),
    password: Yup.string()
      .matches(
        validatePassword,
        lang === 'en' ? 'Password must be at least 8 characters, 1 number, 1 uppercase letter, 1 lowercase letter and 1 special character' :
        'Passwort muss mindestens 8 Zeichen lang sein, mindestens 1 Zahl, 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Sonderzeichen enthalten'
      )
      .required( lang === 'en' ? 'Password is required' : 'Passwort wird benötigt'),
    isKeepLogin: Yup.boolean().default(false)
  });

  const login = async (values) => {
    try {
      const resp = await authService.login(values);
      const { token } = resp.data;
      authService.setAuthHeaderToken(token);
      authService.setToken(token);
      const me = await authService.me({
        Authorization: `Bearer ${token}`
      });
      dispatchSetLogin(me.data);
      localStorage.setItem('userType', JSON.stringify(me.data?.type));
      localStorage.setItem('userEmail', JSON.stringify(me.data?._id));
      if (!me?.data?.isCompletedProfile || !me?.data?.isApproved) {
        router.push(`/${lang}/profile/update?requireUpdate=1`);
      } else {
        router.push(`/${lang}/conversation`);
      }
    } catch (e) {
      const error = await e;
      toast.error(error?.data?.message || showError(e));
      setLoading(false);
    }
  };

  return (
    <Formik
      validationSchema={schema}
      initialValues={{ email: '', password: '', isKeepLogin: false }}
      onSubmit={(values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
        formikHelpers.setSubmitting(false);
        login(values);
      }}
    >
      {(props: FormikProps<FormValues>) => (
        <form onSubmit={props.handleSubmit}>
          <Form.Group className="form-group">
            <Form.Label className="input-label">{lang === 'en' ? 'Email' : 'E-Mail-Adresse'}</Form.Label>
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
            <Form.Label className="input-label">{lang === 'en' ? 'Password' : 'Passwort'}</Form.Label>
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

            <ShowPasswordIcon
              handleClick={setShowPw}
              showPw={showPw}
              error={props.errors.password}
            />
            <div className="invalid-feedback">{props.errors.password}</div>
          </Form.Group>
          <Form.Group className="mb-10 form-group">
            <div className="xchat-checkbox-area">
              {/* <div className="checkbox"> */}
              <Form.Check
                type="checkbox"
                id="isKeepLogin"
                name="isKeepLogin"
                label={lang === 'en' ? 'Keep me logged in' : 'Eingeloggt bleiben'}
                checked={props.values.isKeepLogin}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
              />
              {/* </div> */}
              <Link legacyBehavior href="/auth/forgot" as="/forgot" key="forgot-password">
                <a href="" className="switcher-text">
                {lang === 'en' ? 'Forgot password?' : 'Passwort vergessen?'}
                </a>
              </Link>
            </div>
          </Form.Group>
          <div className="form-group">
            <button type="submit" className="xchat-btn-fill" disabled={loading}>
              {loading ? <Loader /> : lang === 'en' ? 'Log in' : 'Einloggen'}
            </button>
          </div>
        </form>
      )}
    </Formik>
  );
}

export default connector(LoginForm);
