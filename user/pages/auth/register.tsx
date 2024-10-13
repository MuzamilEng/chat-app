import ProfileDataForm from '@components/profile/personal/profile-data-form';
import VerificationDocument from '@components/profile/personal/verification-document';
import SeoMetaHead from '@components/seo-meta-head';
import HorizontalNonLinearStepper from '@components/stepper';
import { systemService } from '@services/system.service';
import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import BlankWithFooterLayout from 'src/components/layouts/blank-with-footer';
import NickName from './components/nick-name';
import ImageCrop from './components/image-crop';
import Thanks from './components/thanks';
import { toast } from 'react-toastify';
import { authService } from '@services/auth.service';

const RegisterFrom = dynamic(() => import('src/components/auth/register-form'));

interface IProps {
  authUser: any;
  transparentLogo: string;
  authBgImage: string;
}


function Register({ authUser }: IProps) {
  const { lang, currentUser, setCurrentStep, onImageUploadSuccess} = useTranslationContext();
  const [activeStep, setActiveStep] = useState(currentUser ? 1 : 3);

  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});
  const [userType, setUserType] = useState('');
  const [emailStatus, setEmailStatus] = useState(null)

  const steps = [
    'Verify email',
    'Nick name',
    'Profile image',
    // 'Profile data',
    'Verify document',
  ];

  // Handle step completion
  const handleComplete = () => {
    setCompleted((prev) => ({ ...prev, [activeStep]: true }));
    handleNext();
  };

// Handle next step after email verification
const handleNext = () => {
  if (activeStep === 0 && !emailStatus) {
    return; // Prevent moving forward if email is not verified
  }

  setActiveStep((prev) => Math.min(prev + 1, steps.length)); // Move to the next step
};

  // Move to the previous step
  const handleBack = () => {
  
    if (activeStep === 0) {
      toast.error('You cannot go back from this step.');
      return;
    }
    
    // Custom logic to restrict going back from specific steps
    if (activeStep === 1) {
      toast.error('You cannot go back to email verification.');
      return;
    }
  
    // Move to the previous step
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };
  

  const handleRegisterSuccess = (data) => {
    if (data === true) {
      handleComplete(); // Step 0 completed, move to step 1
    }
  };

  const handleNicknameSuccess = (data) => {
    if (data === true) {
      handleComplete(); // Step 1 completed, move to step 2
      setActiveStep(2)
    }
  };


// Check email status
const checkEmailStatus = async () => {
  try {
    const resp = await authService.checkEmail({ email: currentUser?.email });
    if (resp?.data?.user?.emailVerified) {
      setEmailStatus(true);
      handleComplete(); // Move to the next step (Nick name) if email is verified
    } else {
      setEmailStatus(false);
    }
  } catch (error) {
    console.warn(error);
  }
};

  const handleImageSuccess = () => {
    if (onImageUploadSuccess === true) {
      handleComplete(); // Step 3 completed, move to step 4
      setActiveStep(3)
    }
  };

  const handleVerificationDocumentSuccess = (data) => {
    if (data === true) {
      handleComplete();
      setActiveStep(4)
    }
  };

  const handleTypeCheck = (data) => {
    setUserType(data);
    localStorage.setItem('userType', data);
  };

  useEffect(() => {
    if (currentUser && currentUser !== null) {
      setActiveStep(1); // Move to step 1 when currentUser is available
    }
  }, [currentUser]);

  useEffect(() => {
    handleImageSuccess()
  }, [onImageUploadSuccess]);

  useEffect(()=> {
    const userType = localStorage.getItem('userType')
    if(userType) {
      setUserType(userType)
    }
  }, [])

// Handle email verification success
useEffect(() => {
  if (emailStatus === true) {
    setActiveStep(1); // Move to Nickname step once email is verified
  }
}, [emailStatus]);

// Check email status once the user is available
useEffect(() => {
  if (currentUser) {
    checkEmailStatus(); // Mandatory email verification check when user exists
  }
}, [currentUser]);

  
  return (
    <div id="wrapper" className="wrapper">
      <SeoMetaHead pageTitle="Register" />
      <div className="xchat-template-animation xchat-template-layout4">
      <div className="xchat-header" style={{zIndex: 1}}>
        <div className="xchat-transformY- xchat-transition-delay-1">
          <a href="#" className="xchat-logo" >
            <img src={'/images/logo_0.png'} alt="Logo" width="327" />
          </a>
        </div>
      </div>
      <div style={{width: '100%', maxWidth: '90vw', margin: '1vw auto'}} className="">
 { userType === 'model' && activeStep !== 5 && <HorizontalNonLinearStepper
          steps={steps}
          activeStep={activeStep}
          completed={completed}
          handleComplete={handleComplete}
          handleNext={handleNext}
          handleBack={handleBack}
        />}
      </div>
      <div className="container-fluid" style={{marginTop: '-5vw', zIndex: 0}}>
          <div className="row">
            <div className="col-md-6 col-12 xchat-bg-wrap">
            {/* <img src="/images/auth-bg.png" alt="" /> */}
            </div>
            {/* register compoent */}
           { activeStep === 0 && <div className="col-md-6 col-12 xchat-bg-color">
              <div className="xchat-content">
                <h3 className="text-center text-uppercase">{lang === 'en' ? 'Register' : 'Benutzerregistrierung'}</h3>
                <hr />
                <div className="xchat-form">
                  <RegisterFrom type={handleTypeCheck} onSuccess={handleRegisterSuccess} />
                </div>
                <div className="text-center">
                  <p>
                  {lang === 'en' ? 'Already have an account?' : 'Hast du bereits ein Konto?'}
                    <Link legacyBehavior href={`/${lang}/auth/login`} as="/login" key="login">
                      <a className="switcher-text2 inline-text">
                      {lang === 'en' ? 'Sign in' : 'Anmelden'}
                      </a>
                    </Link>
                  </p>
                </div>
              </div>
            </div>}
           {/* verify email */}
           {emailStatus === false &&
           <div style={{marginTop: '1vw'}} className="">
            <div className="thanks-message-container">
              <div className="thank-you-box" style={{padding: '2vw', marginTop: '10vw'}}>
                <p>in order to continue please verify your email first and also check the spam folder</p>
                <p>you can close this window</p>
                {/* <button onClick={checkEmailStatus} type='submit' className="btn btn-primary">
                {lang === 'en' ? 'continue' : 'weiter'}
                </button> */}
                {/* {emailStatus === false && <p style={{color: 'red', textAlign: 'center', fontSize: '1vw', marginTop: '1vw'}}>{lang === 'en' ? 'Please go to your Email account and verify your Email to Continue' : 'Bitte gehe zu deinem E-Mail-Konto und bestätige deinen E-Mail, um fortzufahren'}</p>} */}
              </div>
            </div>
            </div>}
            {/* nickname */}
         {emailStatus === true && activeStep === 1 &&  <NickName onNicknameSuccess={handleNicknameSuccess} />}
          {/* image crop  */}
        { activeStep === 2 &&  <ImageCrop />}
          {/* profile form */}
         {/* { activeStep === 3 &&
          <div className="col-md-6 col-12 xchat-bg-color">
          <div className="xchat-content">
          <h3 className="text-center text-uppercase">{lang === 'en' ? 'Personal Information' : 'Persönliche Informationen'}</h3>
          <ProfileDataForm currentUser={currentUser} onProfileFormSuccess={handleProfileSuccess} />
          </div>
          </div>} */}
            {/* documentation verfication */}
          { activeStep === 3 && authUser && 
           <div className="col-md-6 col-12 xchat-bg-color">
            <div className="xchat-content">
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="mb-1">{lang === 'en' ? 'Verification of Documents:' : 'Überprüfungsdokument'}</h6>
                <p className="mb-0 text-muted small">{lang === 'en' ? 'Provide & Upload your official government issued ID' : 'Nachweisdokument aktualisieren'}</p>
              </div>
              <div className="card-body">
                <VerificationDocument onVerficationDocumentSuccess={handleVerificationDocumentSuccess} activeStep={activeStep} lang={lang} currentUser={currentUser} />
              </div>
            </div>
           </div>
          </div>}

          {activeStep === 4 &&
           <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',}} className="">
            <div className="thanks-message-container">
              <div className="thank-you-box">
                <h1>Thank you for your registration!</h1>
                <p>Your account is currently under review.</p>
                <p>You will be notified via E-Mail once your account has been verified.</p>
                <p>This process may take up to 48 hours.</p>
                <Link legacyBehavior href={`/${lang}/auth/login`} style={{color: 'white'}} as="/login">
                <button className="btn btn-primary">
                {lang === 'en' ? 'Sign in' : 'Anmelden'}
                </button>
                </Link>
              </div>
            </div>
            </div>}
         </div>
        </div>
      </div>
    </div>
  );
}

Register.getInitialProps = async () => {
  try {
    const res = await systemService.getConfigByKeys([
      'transparentLogo',
      'authBgImage'
    ]);
    return res.data;
  } catch (e) {
    return {};
  }
};

const mapStateToProps = (state: any) => ({
  authUser: state.auth
});

Register.Layout = BlankWithFooterLayout;
export default connect(mapStateToProps)(Register);
