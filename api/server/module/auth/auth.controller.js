const Joi = require('joi');
const nconf = require('nconf');
const url = require('url');
const SYSTEM_CONST = require('../system/constants');
const Invite = require("../newsletter/models/invite")

exports.register = async (req, res, next) => {
  const schema = Joi.object().keys({
    type: Joi.string().allow('user', 'model').default('user').required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const validate = schema.validate(req.body);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }

  try {
    const count = await DB.User.count({
      $or: [{ email: validate.value.email.toLowerCase() }, { username: validate.value.username }]
    });
    if (count) {
      return next(PopulateResponse.error({ message: 'This Username or Email has already been used.' }, 'ERR_EMAIL_ALREADY_TAKEN'));
    }

    const query = {
      type: validate.value.type,
      username: validate.value.username,
      email: validate.value.email.toLowerCase(),
      password: validate.value.password
    };

    const user = new DB.User(query);
    user.isActive = true;
    if (user.type === 'user') {
      const freeToken = await DB.Config.findOne({ key: SYSTEM_CONST.FREE_TOKEN });
      user.balance = freeToken ? freeToken.value : 0;
      user.isApproved = true;
    }
    const siteName = await DB.Config.findOne({ key: SYSTEM_CONST.SITE_NAME });
    user.emailVerifiedToken = Helper.String.randomString(48);
    user.balance = 10;
    await user.save();
    // send verify email to user
    await Service.Mailer.send('verify-email.html', user.email, {
      subject: 'Please confirm your e-mail address',
      siteName: siteName ? siteName.value : 'xChat',
      emailVerifyLink: new URL(`v1/auth/verifyEmail/${user.emailVerifiedToken}`, nconf.get('baseUrl')).href
    });

        // Check if the user was invited
        const invitation = await Invite.findOne({
          inviteeEmail: validate.value.email,
          status: 'pending' // Check if it's still pending
        });
    
        if (invitation) {
          // Update the invitation status to accepted
          invitation.status = 'accepted';
          await invitation.save();
    
          // Reward the sender with 10 tokens
          const sender = await DB.User.findById(invitation.sender);
          if (sender) {
            sender.balance = (sender.balance || 0) + 10; // Add 10 tokens to the sender's balance
            await sender.save();
          }
        }

    res.locals.register = PopulateResponse.success(
      { message: 'Your account has been created, please check and verify your mail.' },
      'USER_CREATED'
    );
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.verifyEmailView = async (req, res, next) => {
  const schema = Joi.object().keys({
    token: Joi.string().required()
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }
  try {
    const user = await DB.User.findOne({
      emailVerifiedToken: validate.value.token
    });

    if (!user) {
      return next(PopulateResponse.error({ message: 'This token is incorrect' }, 'ERR_INVALID_EMAIL_VERIFY_TOKEN'));
    }

    if (user) {
      user.emailVerified = true;
      user.emailVerifiedToken = null;
      await user.save();
    }

    return res.redirect(url.format({
      pathname: new URL('/auth/register', nconf.get('siteUrl')).href,
      query: { verified: 'success' }
    }));
  } catch (e) {
    return next(e);
  }
};

exports.forgot = async (req, res, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().email().required()
  });

  const validate = schema.validate(req.body);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }

  try {
    const user = await DB.User.findOne({
      email: validate.value.email
    });
    if (!user) {
      return next(PopulateResponse.error({ message: 'This email is not registered' }, 'ERR_INVALID_EMAIL_ADDRESS'));
    }

    const passwordResetToken = Helper.String.randomString(48);
    await DB.User.update({ _id: user._id }, { $set: { passwordResetToken } });

    // now send email verificaiton to user
    await Service.Mailer.send('forgot-password.html', user.email, {
      subject: 'Forgot password',
      passwordResetLink: new URL(`v1/auth/passwordReset/${passwordResetToken}`, nconf.get('baseUrl')).href,
      user: user.toObject()
    });

    res.locals.forgot = PopulateResponse.success(
      { message: 'Your password email has been sent.' },
      'FORGOT_PASSWORD_EMAIL_SENT'
    );
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.resetPasswordView = async (req, res, next) => {
  try {
    const user = await DB.User.findOne({
      passwordResetToken: req.params.token
    });

    const siteName = await DB.Config.findOne({ key: SYSTEM_CONST.SITE_NAME });
    if (!siteName || !siteName.value) {
      return PopulateResponse.serverError({ msg: 'Missing site name!' });
    }
    const siteLogo = await DB.Config.findOne({ key: SYSTEM_CONST.SITE_LOGO });
    if (!siteLogo || !siteLogo.value) {
      return PopulateResponse.serverError({ msg: 'Missing site logo!' });
    }
    if (!user) {
      return res.render('not-found.html');
    }

    if (req.method === 'GET') {
      return res.render('auth/change-password.html', {
        openForm: true,
        error: true,
        siteName: siteName.value,
        siteLogo: siteLogo.value
      });
    }

    if (!req.body.password) {
      return res.render('auth/change-password.html', {
        openForm: true,
        error: true,
        siteName: siteName.value,
        siteLogo: siteLogo.value
      });
    }
    user.password = req.body.password;
    user.passwordResetToken = null;
    await user.save();

    return res.render('auth/change-password.html', {
      openForm: false,
      error: false,
      siteName: siteName.value,
      siteLogo: siteLogo.value
    });
  } catch (e) {
    return next(e);
  }
};
