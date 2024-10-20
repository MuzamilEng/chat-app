const _ = require('lodash');
const passport = require('passport');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const Image = require('../../media/components/image');

const SYSTEM_CONST = require('../../system/constants');
const UserDto = require('../dtos/user.dto');

/**
 * Create a new user
 * Using by Administrator
 */
exports.create = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      username: Joi.string().required(),
      phoneNumber: Joi.string().allow(null, '').optional(),
      role: Joi.string().valid('admin', 'user').default('user').required(),
      type: Joi.string().valid('user', 'model').default('user').required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      balance: Joi.number().min(0).allow(null).optional(),
      address: Joi.string().allow(null, '').optional(),
      postCode: Joi.string().allow(null, '').optional(),
      state: Joi.string().allow(null, '').optional(),
      city: Joi.string().allow(null, '').optional(),
      country: Joi.string().allow(null, '').optional(),
      isActive: Joi.boolean().allow(null).default(true).optional(),
      avatar: Joi.string().allow(null, '').optional(),
      emailVerified: Joi.boolean().allow(null).default(true).optional(),
      isCompletedProfile: Joi.boolean().allow(null).default(true).optional(),
      isBlocked: Joi.boolean().allow(null).default(true).optional(),
      isApproved: Joi.boolean().allow(null).default(false).optional()
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    if (validate.value.role === 'admin' && !validate.value.password) {
      return next(
        PopulateResponse.validationError({ msg: 'Admin accounnt needs password to login, please enter password!' })
      );
    }

    const user = await Service.User.create(validate.value);
    res.locals.user = user;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * do update for admin update
 */
exports.update = async (req, res, next) => {
  try {
    const user = req.params.id ? await DB.User.findOne({ _id: req.params.id }) : req.user;
    let publicFields = ['address', 'phoneNumber', 'isActive', 'avatar', 'email', 'isBlocked'];
    if (req.user.role === 'admin') {
      publicFields = publicFields.concat(['isCompletedProfile', 'emailVerified', 'role', 'username', 'balance']);
      req.body.password && (publicFields = publicFields.concat(['password']));
    }

    // check age
    if (req.body.age && req.body.age < 18) {
      return next(
        PopulateResponse.validationError({ msg: 'Age must be greater than 18!' })
      );
    }

    if (req.body.balance && req.body.balance < 0) {
      return next(
        PopulateResponse.validationError({ msg: 'Balance must be greater or equal 0' })
      );
    }

    const fields = _.pick(req.body, publicFields);
    _.merge(user, fields);
    if (user.type === 'user') {
      user.isApproved = true;
    }
    await user.save();

    res.locals.update = user;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.updateNickname = async (req, res, next) => {

  // Validate the request body
  const schema = Joi.object().keys({
    nickname: Joi.string().required(),
    userId: Joi.string().required()
  });

  const validate = schema.validate(req.body);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }

  const { nickname, userId } = validate.value;

  try {
    // Check for duplicate nickname
    const count = await DB.User.countDocuments({
      $and: [
        { nickname: nickname }, // Check for duplicates in the nickname field
        { _id: { $ne: userId } } // Exclude the current user
      ]
    });

    if (count > 0) {
      return next(PopulateResponse.error({ message: 'This nickname is already taken. Please choose another one.' }, 'ERR_NICKNAME_ALREADY_TAKEN'));
    }

    // Find user by ID
    const user = await DB.User.findById(userId);
    if (!user) {
      return next(PopulateResponse.error({ message: 'User not found.' }, 'ERR_USER_NOT_FOUND'));
    }

    // Update the user's nickname
    user.nickname = nickname;
    user.username = nickname; // Ensure this matches the correct field in your User model

    // Save the updated user
    await user.save();

    res.locals.updateNickname = PopulateResponse.success(
      { message: 'Nickname has been updated successfully.' },
      'NICKNAME_UPDATED'
    );
    return next();
  } catch (e) {
    return next(e);
  }
};


exports.checkEmailVarification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await DB.User.findOne({ email });
    if (!user) {
      return next(PopulateResponse.notFound({ message: 'User is not found' }));
    }
    res.locals.checkEmailVarification = {
      user
    }
    return next();
  } catch (e) {
    return next(e);
  }
}


exports.me = (req, res, next) => {
  res.locals.me = req.user.getPublicProfile();
  next();
};

exports.findOne = async (req, res, next) => {
  try {
    const user = await DB.User.findOne({
      _id: req.params.id
    });
    res.locals.user = user;
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * find user from Add Contact Page
 */
exports.findByUsername = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      username: Joi.string().required()
    });

    const validate = schema.validate(req.params);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    const query = _.merge(validate.value, {
      // type: req.user.type === 'model' ? 'user' : 'model',
      type: 'model',
      isCompletedProfile: true,
      isApproved: true,
      isActive: true,
      isBlocked: false
    });
    const user = await DB.User.findOne(query);
    if (!user) {
      return next(PopulateResponse.notFound({ message: 'User is not found' }));
    }

    const contact = await DB.Contact.findOne({
      $or: [
        { addedBy: req.user._id, userId: user._id },
        { addedBy: user._id, userId: req.user._id }
      ]
    });
    res.locals.user = { ...user.getPublicProfile(), isFriend: !!contact, contactId: contact?._id || null };
    return next();
  } catch (e) {
    return next(e);
  }
};

// default find 
exports.defaultFindByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await DB.User.findOne({ username });
    if (!user) {
      return next(PopulateResponse.notFound({ message: 'User is not found' }));
    }
    res.locals.user = {
      user
    }
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * update user avatar
 */
exports.updateAvatar = async (req, res, next) => {
  try {
    const user = req.params.id ? await DB.User.findOne({ _id: req.params.id }) : req.user;
    if (!user) {
      return next(PopulateResponse.notFound());
    }

    const avatarSize = await DB.Config.findOne({ key: SYSTEM_CONST.AVATAR_SIZE });
    if (!avatarSize || !avatarSize.value) {
      return next(PopulateResponse.serverError({ msg: 'Missing avatar size!' }));
    }

    const size = avatarSize.value.split('x');
    const width = Helper.Number.isNumber(size[0]) ? size[0] : 200;
    const height = Helper.Number.isNumber(size[1]) ? size[1] : 200;
    // create thumb for the avatar
    const thumbPath = await Image.resize({
      input: req?.file?.path,
      width,
      height,
      resizeOption: '^'
    });

    await DB.User.update({ _id: req.params.id || req.user._id }, { $set: { avatar: thumbPath } });

    // unlink old avatar
    if (user.avatar && !Helper.String.isUrl(user.avatar) && fs.existsSync(path.resolve(user.avatar))) {
      fs.unlinkSync(path.resolve(user.avatar));
    }
    // remove tmp file
    // if (fs.existsSync(path.resolve(req.file.path))) {
    //   fs.unlinkSync(path.resolve(req.file.path));
    // }

    res.locals.updateAvatar = {
      url: DB.User.getAvatarUrl(thumbPath)
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.updateAvatar2 = async (req, res, next) => {
  try {
    // Fetch the user by the provided ID in the body
    const user = req.body.id ? await DB.User.findOne({ _id: req.body.id }) : null;
    if (!user) {
      return next(PopulateResponse.notFound());
    }

    const avatarSize = await DB.Config.findOne({ key: SYSTEM_CONST.AVATAR_SIZE });
    if (!avatarSize || !avatarSize.value) {
      return next(PopulateResponse.serverError({ msg: 'Missing avatar size!' }));
    }

    const size = avatarSize.value.split('x');
    const width = Helper.Number.isNumber(size[0]) ? size[0] : 200;
    const height = Helper.Number.isNumber(size[1]) ? size[1] : 200;

    // Create thumb for the avatar
    const thumbPath = await Image.resize({
      input: req?.file?.path,
      width,
      height,
      resizeOption: '^'
    });

    // Update the user's avatar
    await DB.User.updateOne({ _id: user._id }, { $set: { avatar: thumbPath } });

    // Unlink old avatar if it exists
    if (user.avatar && !Helper.String.isUrl(user.avatar) && fs.existsSync(path.resolve(user.avatar))) {
      fs.unlinkSync(path.resolve(user.avatar));
    }

    res.locals.updateAvatar2 = {
      url: DB.User.getAvatarUrl(thumbPath),
    };
    return next();
  } catch (e) {
    return next(e);
  }
};


async function checkAndConvertFriend(models, user) {
  const query = {
    $or: [
      { userId: user._id, addedBy: { $in: models } },
      { userId: { $in: models }, addedBy: user._id }
    ]
  };
  const contacts = await DB.Contact.find(query);
  const array = models.map((model) => {
    const data = new UserDto(model).toSearchResponse(user.role === 'admin');
    const isFriend = contacts.find(
      (contact) => contact.userId.toString() === model._id.toString() || contact.addedBy.toString() === model._id.toString()
    );

    data.isFriend = !!isFriend;
    data.nickname = model.nickname || '';
    return data;
  });
  return array;
}

exports.search = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;
  
  try {
    let query = Helper.App.populateDbQuery(req.query, {
      text: ['phoneNumber', 'email', 'username'],
      boolean: ['isOnline', 'isApproved', 'isCompletedProfile', 'isCompletedDocument', 'isActive', 'isBlocked', 'emailVerified'],
      equal: ['role', 'type', 'gender', 'city', 'state', 'country']
    });

     // Ensure admin users are excluded
     query = {
      ...query,
      role: { $ne: 'admin' } // Exclude users with the role 'admin'
    };
    
    if (req.user.role !== 'admin') {
      query = {
        ...query,
        isApproved: true,
        isCompletedProfile: true,
        isActive: true,
        isBlocked: false
      };
    }

    if (req.query.postCode) {
      const postCodePrefix = req.query.postCode.slice(0, 2);
      query = {
        ...query,
        postCode: { $regex: `^${postCodePrefix}` }
      };
    }

    // Set default sort to balance descending
    let sort = { balance: -1, createdAt: -1 };

    // Check if there's a custom sort parameter in the query
    if (req.query.sort) {
      sort = Helper.App.populateDBSort(req.query);
    } else{
      sort = { createdAt: -1 };
    }

    const count = await DB.User.count(query);
    const items = await DB.User.find(query)
      .collation({ locale: 'en' })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    res.locals.search = {
      count,
      items: await checkAndConvertFriend(items, req.user)
    };
    next();
  } catch (e) {
    next(e);
  }
};

exports.defaultSearch = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;
  
  try {
    let query = Helper.App.populateDbQuery(req.query, {
      text: ['phoneNumber', 'email', 'username'],
      boolean: ['isOnline', 'isApproved', 'isCompletedProfile', 'isCompletedDocument', 'isActive', 'isBlocked', 'emailVerified'],
      equal: ['role', 'type', 'gender', 'city', 'state', 'country']
    });

    if (req.query.postCode) {
      const postCodePrefix = req.query.postCode.slice(0, 2);
      query = {
        ...query,
        postCode: { $regex: `^${postCodePrefix}` }
      };
    }

    // Set default sort to balance descending
    let sort = { balance: -1 };

    // Check if there's a custom sort parameter in the query
    if (req.query.sort) {
      sort = Helper.App.populateDBSort(req.query);
    }

    const count = await DB.User.count(query);
    const items = await DB.User.find(query)
      .collation({ locale: 'en' })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    res.locals.defaultSearch = {
      count,
      items: items,
    };
    next();
  } catch (e) {
    next(e);
  }
};

exports.searchFriends = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;
  try {
    let query = Helper.App.populateDbQuery(req.query, {
      text: ['phoneNumber', 'email', 'username'],
      boolean: ['isOnline', 'isApproved', 'isCompletedProfile', 'isCompletedDocument', 'isActive', 'isBlocked'],
      equal: ['role', 'type', 'gender', 'city', 'state', 'country']
    });

    if (req.user.role !== 'admin') {
      query = {
        ...query,
        isApproved: true,
        isCompletedProfile: true,
        isActive: true,
        isBlocked: false
      };
    }

    const sort = Helper.App.populateDBSort(req.query);
    const items = await DB.User.find(query)
      .collation({ locale: 'en' })
      .sort(sort)
      .exec();

    // add user response and check for friend
    const newItems = await checkAndConvertFriend(items, req.user);
    const data = newItems.filter((i) => i.isFriend);
    res.locals.search = {
      count: data.length,
      items: data.slice(page * take, (page + 1) * take)
    };
    next();
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const user = DB.User.findOne({ _id: req.params.userId });
    if (!user) {
      return next(PopulateResponse.notFound());
    }

    if (user.role === 'admin') {
      return next(PopulateResponse.forbidden());
    }

    // permanently delete
    // contact
    await DB.Contact.deleteMany({
      $or: [{ addedBy: req.params.userId }, { userId: req.params.userId }]
    });
    // conversation
    await DB.Conversation.deleteMany({ memberIds: req.params.userId });
    // conversation meta
    await DB.ConversationUserMeta.deleteMany({ userId: req.params.userId });
    // message
    await DB.Message.deleteMany({
      $or: [{ senderId: req.params.userId }, { recipientId: req.params.userId }]
    });
    // device
    await DB.Device.deleteMany({ userId: req.params.userId });
    // invoice
    await DB.Invoice.deleteMany({ userId: req.params.userId });
    // transaction
    await DB.Transaction.deleteMany({ userId: req.params.userId });
    // payout
    await DB.PayoutRequest.deleteMany({ modelId: req.params.userId });
    // purchase item
    const purchaseItems = await DB.PurchaseItem.find({ userId: req.params.userId }).exec();
    if (user.type === 'model') {
      // sell item - not remove purchase item
      const sellItemIds = purchaseItems.map((i) => i.sellItemId);
      await DB.SellItem.deleteMany({
        $and: [{ userId: req.params.userId }, { _id: { $nin: sellItemIds } }]
      });

      // earning
      await DB.Earning.deleteMany({ modelId: req.params.userId });
    }
    // media - not remove purchase item
    const mediaIds = purchaseItems.map((i) => i.mediaId);
    await DB.Media.deleteMany({
      $and: [{ ownerId: req.params.userId }, { _id: { $nin: mediaIds } }]
    });
    await DB.PurchaseItem.deleteMany({ userId: req.params.userId });
    // share love
    await DB.ShareLove.deleteMany({
      $or: [{ userId: req.params.userId }, { modelId: req.params.userId }]
    });
    // phone verify
    await DB.VerifyCode.deleteMany({ userId: req.params.userId });
    // user social
    // await DB.UserSocial.deleteMany({ userId: req.params.userId });
    await user.remove();
    res.locals.remove = { success: true };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      username: Joi.string().min(3).required(),
      gender: Joi.string().allow('male', 'female', 'transgender').required(),
      bio: Joi.string().min(6).required(),
      age: Joi.number().min(18).required(),
      address: Joi.string().allow('', null).optional(),
      city: Joi.string().allow('', null).optional(),
      state: Joi.string().allow('', null).optional(),
      country: Joi.string().allow('', null).optional(),
      phoneNumber: Joi.string().allow('', null).optional(),
      email: Joi.string().email().required(),
      postCode: Joi.string().allow('', null).optional(),
      id: Joi.string().allow('', null).optional()
    });


    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const user = await DB.User.findOne({ _id: validate.value.id || req.user._id })

    if (!user) {
      return next(PopulateResponse.error({ msg: 'User is not found!' }));
    }

    const username = validate.value.username.toLowerCase().trim();
    const email = validate.value.email.trim();
    const count = await DB.User.count({ $or: [{ username }, { email }], _id: { $ne: user._id } });

    if (count) {
      return next(PopulateResponse.error({ msg: 'This username or email has been taken!' }));
    }

    _.merge(user, validate.value);

    await user.save();
    const isCompletedProfile = await Service.User.updateCompletedProfile(user);
    user.isCompletedProfile = isCompletedProfile.success;
    res.locals.update = user.getPublicProfile();
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      address: Joi.string().required(),
      city: Joi.string().allow(null, '').optional(),
      state: Joi.string().allow(null, '').optional(),
      country: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      birthday: Joi.string().required(),
      instagram: Joi.string().allow(null, '').optional(),
      twitter: Joi.string().allow(null, '').optional(),
      number: Joi.string().required(),
      type: Joi.string().allow('passport', 'ID').required(),
      zipCode: Joi.string().required(),
      isConfirm: Joi.boolean().required(),
      isExpired: Joi.boolean().allow(null, '').default(false).optional(),
      expiredDate: Joi.string().allow(null, '').optional(),
      isApproved: Joi.boolean().optional(),
      id: Joi.string().allow('', null).optional(),
      gender: Joi.string().allow(null, 'male', 'female', 'transgender').optional(),
      age: Joi.number().optional(),
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const query = { _id: req.body.id };
    const user = await DB.User.findOne(query);
    if (!user) {
      return next(PopulateResponse.notFound());
    }
 
    if(validate.value.age) {
      user.age = validate.value.age;
    }

    if(validate.value.isApproved === true) {
      user.isApproved = true;
    }

    
    if(validate.value.gender){
      user.gender = validate.value.gender;
    }

    // Update user document
    user.verificationDocument = Object.assign(user.verificationDocument, _.omit(validate.value, ['isApproved']));
    user.isCompletedDocument = true;
    
    user.country = validate.value.country;
    user.state = validate.value.state;
    user.city = validate.value.city;
        const siteName = await DB.Config.findOne({ key: SYSTEM_CONST.SITE_NAME });
        // Send verification success email to the user
        if(validate.value.isApproved === true) {
          await Service.Mailer.send('verification-success.html', user.email, {
            subject: 'Congratulations! Your Document has been Verified',
            siteName: siteName ? siteName.value : 'Girls2Dream.com',
            nickname: user.nickname || 'there', // Assuming `nickname` is used as a nickname
          });
        } else{
          await Service.Mailer.send('verification-success2.html', user.email, {
            subject: 'Congratulations! Your Document has been submitted',
            siteName: siteName ? siteName.value : 'Girls2Dream.com',
            nickname: user.nickname || 'there', // Assuming `nickname` is used as a nickname
          });
        }


    await user.save();

    // Attach the updated document to the response
    res.locals.document = user.verificationDocument;
    return next();
  } catch (e) {
    return next(e);
  }
};



exports.updateTokenPerMessage = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      token: Joi.number().min(1).required()
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    if (req.user.type !== 'model') {
      return next(PopulateResponse.forbidden({ message: 'Only models can update!' }));
    }

    req.user.tokenPerMessage = validate.value.token;
    await req.user.save();
    res.locals.tokenPerMessage = req.user;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.getOTP = async (req, res, next) => {
  try {
    const code = process.env.PHONE_DEBUG ? '0000' : Helper.String.randomString(4, '1234567890');
    let data = await DB.VerifyCode.findOne({ email: req.user.email });
    if (!data) {
      data = new DB.VerifyCode({ userId: req.user._id, email: req.user.email });
    }
    data.code = code;
    await data.save();
    const siteName = await DB.Config.findOne({ key: SYSTEM_CONST.SITE_NAME });
    // send mail with verify code to user
    await Service.Mailer.send('code-deactive-email.html', req.user.email, {
      subject: 'Your code deactive email',
      verifyCode: code.toString(),
      siteName: siteName?.value || 'XChat'
    });

    res.locals.getOTP = PopulateResponse.success({ message: 'Send OTP is successfully!' }, 'OTP_SENT');
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * update model certification photo
 */
exports.updateCertificationPhoto = async (req, res, next) => {
  try {
    // Ensure `req.body.id` is provided
    console.log('req.body.id:', req.body.id);

    // Check if a valid user is found
    const user = req.body.id ? await DB.User.findOne({ _id: req.body.id, type: 'model' }) : null;

    if (!user) {
      // If no user is found, return a "Not Found" response
      return next(PopulateResponse.notFound('User not found or invalid user type.'));
    }

    // Set default width and height for thumbnail
    const thumbnailSize = await DB.Config.findOne({ key: SYSTEM_CONST.PHOTO_THUMB_SIZE });
    let width = 200;
    let height = 200;

    if (thumbnailSize) {
      const spl = thumbnailSize.value.split('x');
      if (spl.length === 2) {
        width = parseInt(spl[0], 10);
        height = parseInt(spl[1], 10);
      }
    }

    // Resize the image
    const thumbPath = await Image.resize({
      input: req.file.path,
      width,
      height,
      resizeOption: '^'
    });

    // Construct update field dynamically
    const updateString = `verificationDocument.${req.query.position}`;
    const update = {
      [updateString]: thumbPath
    };

    // Perform the update on the user's document
    await DB.User.update(
      { _id: req.body.id },
      { $set: update }
    );

    // Unlink the old certification document if it exists and is not a URL
    if (
      user.verificationDocument &&
      user.verificationDocument[req.query.position] &&
      !Helper.String.isUrl(user.verificationDocument[req.query.position]) &&
      fs.existsSync(path.resolve(user.verificationDocument[req.query.position]))
    ) {
      fs.unlinkSync(path.resolve(user.verificationDocument[req.query.position]));
    }

    // Send the response
    res.locals.updateCertificationPhoto = {
      url: DB.User.getAvatarUrl(update[updateString])
    };

    return next();
  } catch (error) {
    // Log error and pass it to the next middleware
    console.error('Error in updateCertificationPhoto:', error);
    return next(error);
  }
};

/**
 * User update password
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      newPassword: Joi.string().min(6).required()
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    return passport.authenticate('local', async (err, user, info) => {
      const error = err || info;
      if (error) {
        return next(error);
      }
      if (!user) {
        return next(PopulateResponse.notFound());
      }

      // eslint-disable-next-line no-param-reassign
      user.password = validate.value.newPassword;
      await user.save();

      res.locals.updatePassword = {
        success: true
      };
      return next();
    })(req, res, next);
  } catch (e) {
    return next(e);
  }
};

/**
 * User deactive account yourself
 */
exports.deactiveAccount = async (req, res, next) => {
  try {
    const user = req.user;
    user.isBlocked = true;
    await user.save();

    res.locals.deactive = PopulateResponse.success(
      { message: 'Your account has been deactived, you will be logged out.' },
      'USER_DEACTIVED'
    );
    next();
  } catch (e) {
    next(e);
  }
};
