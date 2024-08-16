import PageTitle from '@components/page-title';
import { systemService } from '@services/system.service';
import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import BlankWithFooterLayout from 'src/components/layouts/blank-with-footer';
import { authService } from 'src/services/auth.service';

const ForgotPasswordForm = dynamic(() => import('src/components/auth/forgot-password-form'));

interface IProps {
  authUser: any;
  transparentLogo: string;
  authBgImage: string;
}
function ForgotPassword({
  authUser,
  authBgImage,
  transparentLogo = '/images/logo-white.svg'
}: IProps) {
  const { t, lang } = useTranslationContext();
  const router = useRouter();
  const bg = authBgImage || '/images/auth-bg.jpg';

  const checkAuthUser = () => {
    if (authService.isLoggedin()) {
      if (!authUser) {
        authService.removeToken();
        router.push('/auth/login');
      }
      if (authUser && (!authUser.isCompletedProfile || !authUser.isApproved)) {
        Router.push(`/${lang}/profile/update?requireUpdate=1`);
      } else {
        router.push('/conversation');
      }
    }
  };

  useEffect(() => {
    checkAuthUser();
  }, [authUser]);

  return (
    <section className="xchat-template-animation xchat-template-layout4">
      <PageTitle title="Forgot password" />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6 col-12 xchat-bg-wrap">
            <div className="xchat-bg-img" style={{ backgroundImage: `url(${bg})` }}>
              {transparentLogo && (
              <div className="xchat-header">
                <div className="xchat-transformY-50 xchat-transition-delay-1">
                  <Link legacyBehavior href="/auth/login" as="/login" key="login">
                    <a href="" className="xchat-logo">
                      <img src={transparentLogo} alt="Logo" width="327" />
                    </a>
                  </Link>
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
              <h3 className="text-center text-uppercase">Passwort vergessen</h3>
              <hr />
              <div className="xchat-form">
                <ForgotPasswordForm />
              </div>
              <div className="text-center">
                <p>
                Kein Benutzerkonto vorhanden?
                  <Link legacyBehavior href="/auth/register" as="/register" key="register">
                    <a className="switcher-text2 inline-text">
                    Registrieren
                    </a>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

ForgotPassword.getInitialProps = async () => {
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
  authUser: state.auth.authUser
});

ForgotPassword.Layout = BlankWithFooterLayout;
export default connect(mapStateToProps)(ForgotPassword);
