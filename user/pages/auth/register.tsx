import SeoMetaHead from '@components/seo-meta-head';
import { systemService } from '@services/system.service';
import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import BlankWithFooterLayout from 'src/components/layouts/blank-with-footer';

const RegisterFrom = dynamic(() => import('src/components/auth/register-form'));

interface IProps {
  authUser: any;
  transparentLogo: string;
  authBgImage: string;
}

function Register({
  authUser,
  authBgImage,
  transparentLogo = '/images/logo-white.svg'
}: IProps) {
  const router = useRouter();
  const bg = authBgImage || '/images/auth-bg.jpg';
  const { t, lang } = useTranslationContext();

  const checkAuthUser = () => {
    if (authUser.isLoggedIn) {
      if (!authUser.isCompletedProfile || !authUser.isApproved) {
        router.push(`/${lang}/profile/update?requireUpdate=1`);
        return;
      }
      router.push('/conversation');
    }
  };

  useEffect(() => {
    checkAuthUser();
  }, [authUser]);

  return (
    <div id="wrapper" className="wrapper">
      <SeoMetaHead pageTitle="Register" />
      <div className="xchat-template-animation xchat-template-layout4">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 col-12 xchat-bg-wrap">
              <div className="xchat-bg-img" style={{ backgroundImage: `url(${bg})` }}>
                {transparentLogo
                && (
                <div className="xchat-header">
                  <div className="xchat-transformY-50 xchat-transition-delay-1">
                    <a href="#" className="xchat-logo">
                      <img src={transparentLogo} alt="Logo" width="327" />
                    </a>
                  </div>
                </div>
                )}
              </div>
            </div>
            <div className="col-md-6 col-12 xchat-bg-color">
              <div className="xchat-content">
                <a href="/" className="header-logo-mobile">
                  <img src={transparentLogo} alt="Logo" width="327" />
                </a>
                <h3 className="text-center text-uppercase">{lang === 'en' ? 'Register' : 'Benutzerregistrierung'}</h3>
                <hr />
                <div className="xchat-form">
                  <RegisterFrom />
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
            </div>
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
