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

const RegisterFrom = dynamic(() => import('src/components/auth/register-form'));

interface IProps {
  authUser: any;
  transparentLogo: string;
  authBgImage: string;
}


function Register({ authUser }: IProps) {
  const { lang, currentUser, setCurrentStep, onImageUploadSuccess} = useTranslationContext();
  const [activeStep, setActiveStep] = useState(currentUser ? 1 : 0);

  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});
  const [userType, setUserType] = useState('');

  const steps = [
    'Verify email',
    'Nick name',
    'Profile image',
    'Profile data',
    'Verify document',
  ];

  // Handle step completion
  const handleComplete = () => {
    setCompleted((prev) => ({ ...prev, [activeStep]: true }));
    handleNext();
  };

  // Move to the next step only if the current step is completed
  const handleNext = () => {
    if (!completed[activeStep] && activeStep !== 0) return; // Prevent moving forward if step is not completed

    setActiveStep((prev) => Math.min(prev + 1, steps.length)); // Ensure we don't exceed step count
  };

  // Move to the previous step
  const handleBack = () => {
    if(activeStep === 1) {
      toast.error('You can not go back');
      return;
    }
    setActiveStep((prev) => Math.max(prev - 1, 0)); // Ensure we don't go below step 0
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

  const handleProfileSuccess = (data) => {
    if (data === true) {
      handleComplete(); // Step 2 completed, move to step 3
      setCurrentStep(4)
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
      setCurrentStep(5)
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

  
  return (
    <div id="wrapper" className="wrapper">
      <SeoMetaHead pageTitle="Register" />
      <div className="xchat-template-animation xchat-template-layout4">
      <div className="xchat-header">
        <div className="xchat-transformY- xchat-transition-delay-1">
          <a href="#" className="xchat-logo">
            <img src={'/images/logo_0.png'} alt="Logo" width="327" />
          </a>
      <h5 className="text-center">You need to complete all these steps to register your account, only then you can start using girls2dream.com. <br /> And once your email is verified, you can complete your profile. </h5>
        </div>
      </div>
      <div style={{width: '100%', maxWidth: '90vw', margin: '2vw auto'}} className="">
 { userType === 'model' && activeStep !== 5 && <HorizontalNonLinearStepper
          steps={steps}
          activeStep={activeStep}
          completed={completed}
          handleComplete={handleComplete}
          handleNext={handleNext}
          handleBack={handleBack}
        />}
      </div>
      <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 col-12 xchat-bg-wrap">
            <img src="/images/auth-bg.png" alt="" />
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
            {/* nickname */}
         { activeStep === 1 &&  <NickName onNicknameSuccess={handleNicknameSuccess} />}
          {/* image crop  */}
        { activeStep === 2 &&  <ImageCrop />}
          {/* profile form */}
         { activeStep === 3 &&
          <div className="col-md-6 col-12 xchat-bg-color">
          <div className="xchat-content">
          <h3 className="text-center text-uppercase">{lang === 'en' ? 'Personal Information' : 'Persönliche Informationen'}</h3>
          <ProfileDataForm currentUser={currentUser} onProfileFormSuccess={handleProfileSuccess} />
          </div>
          </div>}
            {/* documentation verfication */}
          { activeStep === 4 && authUser && 
           <div className="col-md-6 col-12 xchat-bg-color">
            <div className="xchat-content">
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="mb-1">{lang === 'en' ? 'Verification Document' : 'Überprüfungsdokument'}</h6>
                <p className="mb-0 text-muted small">{lang === 'en' ? 'Update evidence document' : 'Nachweisdokument aktualisieren'}</p>
              </div>
              <div className="card-body">
                <VerificationDocument onVerficationDocumentSuccess={handleVerificationDocumentSuccess} activeStep={activeStep} lang={lang} currentUser={currentUser} />
              </div>
            </div>
           </div>
          </div>}

          {activeStep === 5 &&
           <div style={{marginTop: '1vw'}} className="">
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
