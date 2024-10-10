import { setLogin } from '@redux/auth/actions';
import { useTranslationContext } from 'context/TranslationContext';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { Button, Form, FormControl, Modal } from 'react-bootstrap';
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
  isAgreeToPrivacyPolicy: boolean;
  isAgreeToImages: boolean;
}

function RegisterForm({onSuccess, type: checkUserType}) {
  const [showPw, setShowPw] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [type, setType] = useState('user');
  const { lang, setCurrentUser, setCurrentStep } = useTranslationContext();
  const [isContentChecked, setIsContentChecked] = useState(false);
  const router = useRouter()

  const schema = Yup.object().shape({
    username: Yup.string().optional(),
    email: Yup.string().email( lang === 'en' ? 'Email format is not correct' : 'E-Mail-Format ist nicht korrekt').required( lang === 'en' ? 'Email is required' : 'E-Mail wird benötigt'),
    password: Yup.string()
    .required(lang === 'en' ? 'Password is required' : 'Passwort wird benötigt')
    .min(6, lang === 'en' ? 'Password must be at least 6 characters long' : 'Passwort muss mindestens 6 Zeichen lang sein'),  
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], lang === 'en' ? 'Password confirmation does not match' : 'Passwortbestätigung stimmt nicht mit Passwort überein')
      .required( lang === 'en' ? 'Password confirmation is required' : 'Passwortbestätigung wird benötigt'),
    isAgreeToS: Yup.boolean().default(false),
    isAgreeToPrivacyPolicy: Yup.boolean().required(lang === 'en' ? 'Please accept the agreement contract' : 'Bitte bestätigen Sie die Nutzungsbedingungen.').default(false),
    isAgreeToImages: Yup.boolean().required(lang === 'en' ? 'Please accept the medida showing agreement' : 'Bitte bestätigen Sie die Nutzungsbedingungen. ').default(false)
  });

  const generateRandomName = (minLength = 16) => {
    let name = '';
    while (name.length < minLength) {
      name += Math.random().toString(36).substring(2);
    }
  
    return name.substring(0, minLength);
  };
  

  const handleCheckboxChange2 = () => {
    setIsContentChecked(!isContentChecked);
  };

  const login = async (values) => {
    try {
     const resp = await authService.checkEmail({email: values.email});
      setCurrentUser(resp.data?.user);
      if(resp.data?.user.type === 'user'){
        router.push(`/${lang}/auth/login`);
      } else{
        localStorage.setItem('userRegisterationRecords', JSON.stringify(resp.data?.user));
        window.location.reload();
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleTypecheck = (data) => {
    setType(data);
    checkUserType(data);
  };


  const register = async (data: any) => {
    const {
      username, email, password, confirmPassword, isAgreeToS, isAgreeToPrivacyPolicy, isAgreeToImages
    } = data;
    if (!isAgreeToS) {
      toast.error( lang === 'en' ? 'Please agree to our terms and conditions' : 'Bitte bestätigen Sie, ob Sie unseren Geschäftsbedingungen zustimmen.');

    } else if (type === 'model' && !isContentChecked) {
      toast.error( lang === 'en' ? 'Please check the last checkbox to continue.' : 'Bitte wählen Sie das Kontrollkästchen, um fortzufahren.');
      // return;
    }
     else if (type === 'model' && !isAgreeToPrivacyPolicy){
      toast.error( lang === 'en' ? 'Please agree to our agreement' : 'Bitte bestätigen Sie, ob Sie unsere Nutzungsbedingungen zustimmen.');
    } else if (type === 'model' && !isAgreeToImages) {
      toast.error( lang === 'en' ? 'Please check the 2nd last checkbox to continue.' : 'Bitte wählen Sie das Kontrollkästchen, um fortzufahren.');
      // return;
    }
    else if (confirmPassword !== password) {
      toast.error( lang === 'en' ? 'Password confirmation does not match' : 'Passwortbestätigung ist falsch.');
    } else {
      await authService
        .register({
          username : type === 'model' ? generateRandomName() : username, email, password, type
          // username, email, password, type
        })
        .then((resp) => {
          toast.success(resp?.data?.data?.message || lang === 'en' ? 'Registration successful!' : 'Registrierung erfolgreich!');
          login({email: email})
          onSuccess(true)
          // setTimeout(() => {
          //   window.location.href = `/${lang}/auth/login`;
          // }, 1000);
        })
        .catch(async (e) => {
          const error = await Promise.resolve(e);
          toast.error(error?.data?.message || lang === 'en' ? 'Something went wrong!' : 'Etwas ist schiefgelaufen!');
        });
    }
    setRequesting(false);
  };




  return (
    <Formik
      validationSchema={schema}
      initialValues={{
        username: '', email: '', password: '', confirmPassword: '', isAgreeToS: false, isAgreeToPrivacyPolicy: false, isAgreeToImages: false
      }}
      onSubmit={(values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
        setRequesting(true);
        register(values);
        formikHelpers.setSubmitting(false);
      }}
    >
      {(props: FormikProps<FormValues>) => (
        <form onSubmit={props.handleSubmit}>
          { type === 'user' &&  <Form.Group className="form-group">
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
          </Form.Group>}
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
              onChange={()=> handleTypecheck('user')}
              value="user"
              defaultChecked
              name="type"
              id="user"
              inline
              label={lang === 'de' ? 'Benutzer' : 'User'}
            />
            <Form.Check
              type="radio"
              onChange={() => handleTypecheck('model')}
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
                   {/* commented by muzi */}
                  {/*  <a href="#">Geschäftsbedingungen</a> zu */} 
                </>
              )}
              checked={props.values.isAgreeToS}
              onChange={props.handleChange}
              onBlur={props.handleBlur}
            />
          </Form.Group>

          <Form.Group className="mb-10 form-group">
      <Form.Check
        type="checkbox"
        id="isAgreeToPrivacyPolicy"
        name="isAgreeToPrivacyPolicy"
        label={(
          <>
            {lang === 'de' ? 'Ich stimme den ' : 'I accept the agreement and want to register '}
            <a href="/agreement.pdf" download="agreement.pdf"  style={{ display: 'none' }}></a>
            <span>
               {/* <br /> */}
              <a 
                href="/agreement.pdf" 
                download="agreement.pdf"
                // onMouseEnter={handleMouseEnter}
                // onMouseLeave={handleMouseLeave}
              >
                {/* SVG icon for a PDF file */}
                <svg xmlns="http://www.w3.org/2000/svg" width="0.75em" height="1em" viewBox="0 0 384 512"><path fill="currentColor" d="M181.9 256.1c-5-16-4.9-46.9-2-46.9c8.4 0 7.6 36.9 2 46.9m-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7c18.3-7 39-17.2 62.9-21.9c-12.7-9.6-24.9-23.4-34.5-40.8M86.1 428.1c0 .8 13.2-5.4 34.9-40.2c-6.7 6.3-29.1 24.5-34.9 40.2M248 160h136v328c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V24C0 10.7 10.7 0 24 0h200v136c0 13.2 10.8 24 24 24m-8 171.8c-20-12.2-33.3-29-42.7-53.8c4.5-18.5 11.6-46.6 6.2-64.2c-4.7-29.4-42.4-26.5-47.8-6.8c-5 18.3-.4 44.1 8.1 77c-11.6 27.6-28.7 64.6-40.8 85.8c-.1 0-.1.1-.2.1c-27.1 13.9-73.6 44.5-54.5 68c5.6 6.9 16 10 21.5 10c17.9 0 35.7-18 61.1-61.8c25.8-8.5 54.1-19.1 79-23.2c21.7 11.8 47.1 19.5 64 19.5c29.2 0 31.2-32 19.7-43.4c-13.9-13.6-54.3-9.7-73.6-7.2M377 105L279 7c-4.5-4.5-10.6-7-17-7h-6v128h128v-6.1c0-6.3-2.5-12.4-7-16.9m-74.1 255.3c4.1-2.7-2.5-11.9-42.8-9c37.1 15.8 42.8 9 42.8 9"/></svg>
                <span>{lang === 'de' ? ' Datenschutzbestimmungen ' : ' agreement file '}</span>
              </a>
            </span>
          </>
        )}
        checked={props.values.isAgreeToPrivacyPolicy}
        onChange={props.handleChange}
        onBlur={props.handleBlur}
      />
      {type === 'model' && (
        <Form.Group className="mb-10 form-group">
        <Form.Check
          type="checkbox"
          id="isAgreeToImages"
          name="isAgreeToImages"
          label={(
            <>
            {/* /posts/terms-and-conditions   link commented by muzi*/}
              {lang === 'de' ? 'Ich habe die Geschäftsbedingungen gelesen und (bin damit einverstanden) ich bin damit einverstanden ' : 'I acknowledge and agree that my images will be used and displayed publicly on the website'}
               {/* commented by muzi */}
              {/*  <a href="#">Geschäftsbedingungen</a> zu */} 
            </>
          )}
          checked={props.values.isAgreeToImages}
          onChange={props.handleChange}
          onBlur={props.handleBlur}
        />
      </Form.Group>
      )}

           {type === 'model' && <div style={{marginTop: '1vw'}} className="card-footer d-flex justify-content-between align-items-center">
                <div style={{ display: 'flex' , alignItems: 'start'}} className="flex">
                  <input style={{marginTop: '0.4vw'}} checked={isContentChecked}
                  onChange={handleCheckboxChange2} className='' type="checkbox" name="confirm" id="confirm" />
                  <p style={{width: '100%', maxWidth: '60vw'}} className='ml-2 mt-1'>{lang === 'de' ? 'Ich bin einverstanden' : 'Use of Your Comments, Photos, Videos and Digital Media: In accordance to our gerneral terms and conditons and by submitting and/or uploading data and files such as but not limited to; your story, comments, photos, videos, digital content of any means ( “Your Content” ) on our wall, website and domains, you are authorizing PMS to use, publish, and otherwise reproduce, modify, distribute and grant unlimited downloads to other users and members of Your Content with or without your name in perpetuity, worldwide in any and all PMS related media for any lawful purpose'}</p>
                </div>
                </div>}

          </Form.Group>
          <Form.Group className="form-group">
            <button type="submit" className="xchat-btn-fill" disabled={requesting}>
              {requesting ? <Loader /> : 'Next'}
            </button>
          </Form.Group>
        </form>
      )}
    </Formik>
  );
}

export default RegisterForm;