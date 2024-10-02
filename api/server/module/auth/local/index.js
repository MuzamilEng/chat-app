const passport = require('passport');
const Joi = require('joi');
const { response } = require('express');
const { result } = require('lodash');
const signToken = require('../auth.service').signToken;

exports.adminLogin = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    const error = err || info;
    if (error) {
      return next(error);
    }
    if (!user) {
      return next(PopulateResponse.notFound());
    }

    if (user.role !== 'admin') {
      return next(PopulateResponse.forbidden({ message: 'User can\'t sign in to admin panel' }));
    }

    const expireTokenDuration = 60 * 60 * 24 * 7; // 7 days
    const now = new Date();
    const expiredAt = new Date(now.getTime() + expireTokenDuration * 1000);
    const token = signToken(user._id, user.role, expireTokenDuration);

    res.locals.adminLogin = {
      token,
      expiredAt
    };

    return next();
  })(req, res, next);
};

exports.login = async (req, res, next) => {
  try {
    // Fetch the user data before authentication
    const userData = await DB.User.findOne({ email: req.body.email }).select('type isApproved isBlocked');

    if (!userData) {
      return next(PopulateResponse.notFound({ msg: 'User not found.' }));
    }

    // Check if the user is blocked
    if (userData.isBlocked) {
      return next(PopulateResponse.forbidden({ msg: 'Your account is blocked.' }));
    }

    if (!userData.isApproved) {
      return next(PopulateResponse.forbidden({ msg: 'Your profile is under review.' }));
    }

    // If the user is not blocked and approved, continue with authentication
    passport.authenticate('local', async (err, user, info) => {
      const error = err || info;
      if (error) {
        return next(error);
      }
      if (!user) {
        return next(PopulateResponse.notFound());
      }

      const expireTokenDuration = 60 * 60 * 24 * 7; // 7 days
      const now = new Date();
      const expiredAt = new Date(now.getTime() + expireTokenDuration * 1000);
      const token = signToken(user._id, user.role, expireTokenDuration);

      // Update the user's blocked status (if needed)
      user.isBlocked = false;
      await user.save();

      res.locals.login = {
        token,
        expiredAt,
        // other user data (if needed)
      };

      return next();
    })(req, res, next);
  } catch (error) {
    return next(error);
  }
};



exports.verifyMail = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      email: Joi.string().required(),
      verifyCode: Joi.string().required()
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const user = await DB.User.findOne({ email: validate.value.email });
    if (!user) {
      return next(PopulateResponse.notFound());
    }
    await Service.User.verifyEmail(validate.value.email, validate.value.verifyCode);
    await user.save();
    const expireTokenDuration = 60 * 60 * 24 * 7; // 7 days
    const now = new Date();
    const expiredAt = new Date(now.getTime() + expireTokenDuration * 1000);
    const token = signToken(user._id, user.role, expireTokenDuration);

    res.locals.verifyCode = { token, expiredAt };

    return next();
  } catch (e) {
    return next(e);
  }
};

async function checkAndConvertFriend(models, user) {
  // const query = {
  //   $or: [
  //     { userId: user._id, addedBy: { $in: models } },
  //     { userId: { $in: models }, addedBy: user._id }
  //   ]
  // };
  const contacts = await DB.Contact.find();
 console.log(contacts,"aaaaaaaaaaaaaaa");
  return contacts;
}

// exports.userSearchTest = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 0;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
//     const search = req.query.search || '';

//     // Count total users matching the type
//     const totalCount = await DB.User.countDocuments({ type: "model" });

//     // Find users with matching criteria and apply pagination
//     const modelData = await DB.User.find({
//       type: "model",
//       $or: [
//         { gender: { $regex: search, $options: "i" } },
//         { country: { $regex: search, $options: "i" } }
//       ]
//     }).skip(skip).limit(limit);

//     // Extract necessary fields and structure data for response
//     const filteredModelData = modelData.map(obj => ({
//       verificationDocument: {
//         firstName: obj.verificationDocument.firstName,
//         lastName: obj.verificationDocument.lastName,
//         birthday: obj.verificationDocument.birthday
//       },
//       _id: obj._id,
//       role: obj.role,
//       gender: obj.gender,
//       age: obj.age,
//       country: obj.country,
//       avatarUrl: obj.avatarUrl,
//       createdAt: obj.createdAt
//     }));

//     // Send response with total count, current page, and filtered data
//     res.json({ totalCount: totalCount, currentPage: page, result: filteredModelData });
//   } catch (error) {
//     next(error);
//   }
// };

exports.userSearchTest = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Ensure page is at least 1
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const gender = req.query.gender || '';
    const country = req.query.country || '';
    const city = req.query.city || ''; // Added city filter

    // Create a query object to include dynamic filters
    let query = { type: "model" };

    if (search) {
      query.$or = [
        { gender: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } } // Included city in search
      ];
    }

    if (gender) {
      query.gender = gender;
    }

    if (country) {
      query.country = country;
    }

    if (city) {
      query.city = city; // Added city filter to the query
    }

    // Count total users matching the criteria
    const totalCount = await DB.User.countDocuments(query);

    // Find users with matching criteria and apply pagination
    const modelData = await DB.User.find(query).skip(skip).limit(limit);

    // Extract necessary fields and structure data for response
    const filteredModelData = modelData.map(obj => ({
      verificationDocument: {
        firstName: obj.verificationDocument.firstName,
        lastName: obj.verificationDocument.lastName,
        birthday: obj.verificationDocument.birthday
      },
      _id: obj._id,
      role: obj.role,
      gender: obj.gender,
      age: obj.age,
      country: obj.country,
      city: obj.city, // Added city to the response
      avatarUrl: obj.avatarUrl,
      createdAt: obj.createdAt
    }));

    // Send response with total count, current page, and filtered data
    return res.json({ totalCount: totalCount, currentPage: page, result: filteredModelData });
  } catch (error) {
    // Ensure that the error is handled properly and sent only once
    return next(error);
  }
};


