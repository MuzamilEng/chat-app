const Joi = require('joi');
const SYSTEM_CONST = require('../../system/constants');
const Invite = require("../models/invite")

exports.sendEmail = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      subject: Joi.string().required(),
      content: Joi.string().allow(null, '').optional(),
      userType: Joi.string().allow(null, '').optional()
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    await Service.Newsletter.sendMail(validate.value);
    res.locals.sendEmail = { success: true };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.inviteUser = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      emails: Joi.string().email().required() // Ensure emails are valid and correct
    });
    const validate = validateSchema.validate(req.body);
    // if (validate.error) {
    //   return next(PopulateResponse.validationError(validate.error));
    // }
    
    const siteName = await DB.Config.findOne({ key: SYSTEM_CONST.SITE_NAME });
    if (!siteName || !siteName.value) {
      return next(PopulateResponse.serverError({ msg: 'Missing site name!' }));
    }

    const senderId = req.user?._id; // Get the ID of the sender
    const inviteeEmail = validate.value.emails;

    // Create a new Invite instance
    const invitation = new Invite({
      sender: senderId,
      inviteeEmail: inviteeEmail,
      status: 'pending' // Track the status of the invitation
    });

    // Save the invitation to the database
    await invitation.save();

    // Continue with sending the invite email using the Newsletter service
    await Service.Newsletter.inviteUser(
      Object.assign(validate.value, { type: req.user?.type, siteName: siteName.value })
    );

    res.locals.inviteUser = { success: true };
    return next();
  } catch (e) {
    return next(e);
  }
}