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
import { useSelector } from 'react-redux';

const RegisterFrom = dynamic(() => import('src/components/auth/register-form'));

interface IProps {
  authUser: any;
  transparentLogo: string;
  authBgImage: string;
}


function Register({ authUser }: IProps) {
  const { lang, currentUser, currentStep, setCurrentStep } = useTranslationContext();
  // const authUser = useSelector((state: any)=> state.auth.authUser)

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});

  const steps = [
    'Verify email',
    'Nick name',
    'Profile data',
    'Profile image',
    'Verify document'
  ];

  const handleNext = () => {
    if (!authUser.authUser){
      // donot allow setp 2
      setActiveStep(1)
    }
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleComplete = () => {
    setCompleted((prev) => ({ ...prev, [activeStep]: true }));
    handleNext();
  };

  const handleRegisterSuccess = (data) => {
    if(data === true || activeStep == 1){
      setActiveStep(1)
    }
  }

  const handleNicknameSuccess = (data) => {
    if(data === true){
      setActiveStep(2)
    }
  }

  const handleProfileSuccess = (data) => {
    if(data === true){
      setActiveStep(3)
    }
  }

  const handleImageSuccess = (data) => {
    if(data === true){
      setActiveStep(4)
    }
  }
  // handleImageSuccess
  useEffect(()=> {
    if(authUser.authUser && authUser.authUser !== null){
      setActiveStep(1)
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
      <HorizontalNonLinearStepper
            steps={steps}
            activeStep={activeStep}
            completed={completed}
            handleComplete={handleComplete}
          />
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
                  <RegisterFrom onSuccess={handleRegisterSuccess} />
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
          {/* profile form */}
         { activeStep === 2 && <div className="col-md-6 col-12 xchat-bg-color">
          <div className="xchat-content">
               <h3 className="text-center text-uppercase">{lang === 'en' ? 'Personal Information' : 'Persönliche Informationen'}</h3>
          <ProfileDataForm  currentUser={currentUser} onProfileFormSuccess={handleProfileSuccess} />
          </div>
          </div>}
          {/* image crop  */}
        { activeStep === 3 &&  <ImageCrop onImageSuccess={handleImageSuccess} />}
            {/* documentation verfication */}
          { activeStep === 4 && authUser &&  <div className="col-md-6 col-12 xchat-bg-color">
            <div className="xchat-content">
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="mb-1">{lang === 'en' ? 'Verification Document' : 'Überprüfungsdokument'}</h6>
                <p className="mb-0 text-muted small">{lang === 'en' ? 'Update evidence document' : 'Nachweisdokument aktualisieren'}</p>
              </div>
              <div className="card-body">
                <VerificationDocument lang={lang} currentUser={currentUser} />
              </div>
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
