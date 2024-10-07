import React from 'react';
import BlankWithFooterLayout from 'src/components/layouts/blank-with-footer';


const EmailVerified = () => {
  return (
    <div className='containers' style={{ overflow: 'hidden', textAlign: 'center', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {/* Logo */}
      <div className='logo2'>
        {/* Assuming you have a logo image file in the public folder */}
        <a href="#" className="xchat-logo">
            <img src={'/images/logo_0.png'} alt="Logo" width="327" />
          </a>
      </div>

      {/* Message */}
      <div className='message'>
        <h1>Thank you!</h1>
        <p>Your email has been verified.</p>
        <p>You can close this tab and continue your registration.</p>
      </div>
    </div>
  );
};

EmailVerified.Layout = BlankWithFooterLayout;

export default EmailVerified;