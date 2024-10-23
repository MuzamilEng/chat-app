/* eslint prefer-arrow-callback: 0 */
const _ = require('lodash');

exports.User = (schema) => {
  schema.add({
    // ? --- Public profile ---
    avatar: {
      type: String,
      default: ''
    },
    avatar2: {
      type: String,
      default: ''
    },
    avatarStatus:{
      type: String,
      default: 'pending',
      enum: ['pending', 'verified', 'rejected'], 
   },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      unique: true,
      // allow unique if not null
      sparse: true
    },
    email: {
      type: String,
      index: true
    },
    // number with national format
    phoneNumber: {
      type: String,
      default: '',
      index: true
    },
    gender: {
      type: String,
      default: 'male',
      enum: ['male', 'female', 'transgender'],
      trim: true,
      index: true
    },
    age: {
      type: Number,
    },
    bio: {
      type: String,
      defaule: ''
    },
    address: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: ''
    },
    postCode: {
      type: String,
      default: ''
    },
    balance: {
      type: Number,
      default: 10
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    shareLove: {
      type: Number,
      default: 0
    },
    tokenPerMessage: {
      type: Number,
      default: 1
    },
    type: {
      type: String,
      default: 'user',
      enum: ['user', 'model'],
      index: true
    },
    isCompletedProfile: {
      type: Boolean,
      default: false
    },
    // todo - separate to other collection
    verificationDocument: {
      // ? only public with model data
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      birthday: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      isConfirm: { type: Boolean, default: false },
      isExpired: { type: Boolean, default: false },
      type: { type: String, default: 'ID', enum: ['ID', 'passport', 'driverCard'] },
      frontSide: { type: String, default: '' }, // image of front certification
      backSide: { type: String, default: '' }, // image of back certification
      holding: { type: String, default: '' }, // image of holding certification
      number: { type: String, default: '' },
      expiredDate: { type: String, default: '' }
    },
    // ? --- End public profile ---
    emailVerifiedToken: {
      type: String,
      index: true
    },
    passwordResetToken: {
      type: String,
      index: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    isCompletedDocument: {
      type: Boolean,
      default: false
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    lastOnline: {
      type: Date
    },
    lastOffline: {
      type: Date
    }
  });

  schema.method('toJSON', function toJSON() {
    const user = this.toObject();
    // TODO - convert avatar url from here
    user.avatarUrl = DB.User.getAvatarUrl(user.avatar);
    if (user.verificationDocument) {
      // convert photo for verification document
      if (user.verificationDocument) {
        user.verificationDocument.frontSide
          ? (user.verificationDocument.frontSideUrl = DB.User.getAvatarUrl(user.verificationDocument.frontSide))
          : (user.verificationDocument.frontSideUrl = '');
        user.verificationDocument.backSide
          ? (user.verificationDocument.backSideUrl = DB.User.getAvatarUrl(user.verificationDocument.backSide))
          : (user.verificationDocument.backSideUrl = '');
        user.verificationDocument.holding
          ? (user.verificationDocument.holdingUrl = DB.User.getAvatarUrl(user.verificationDocument.holding))
          : (user.verificationDocument.holdingUrl = '');
        delete user.verificationDocument.frontSide;
        delete user.verificationDocument.backSide;
        delete user.verificationDocument.holding;
      }
    }
    return _.omit(user, ['password', 'emailVerifiedToken', 'passwordResetToken', 'salt', 'avatar']);
  });

  schema.virtual('avatarUrl').get(function avatarUrl() {
    return DB.User.getAvatarUrl(this.avatar);
  });

  /**
   * get user public profile
   * @return {Object} user data
   */
  schema.method('getPublicProfile', function getPublicProfile(toJSON = false) {
    const user = toJSON ? this.toJSON() : this.toObject();
    user.avatarUrl = DB.User.getAvatarUrl(user.avatar);
    const userUnPublicData = [
      'password',
      'emailVerifiedToken',
      'passwordResetToken',
      'salt',
      'emailVerified',
      'phoneVerified',
      'avatar',
    ];
    let data = user;

    // ? dont get verification document when model document is approved or it is a user
    if ((user.type === 'model' && user.isApproved) || user.type === 'user') {
      data = _.omit(user, ['verificationDocument']);
    }

    // ? public fields will be responsed for user and model
    if (user.type === 'user') {
      data = _.omit(data, _.concat(userUnPublicData, ['isCompletedDocument', 'shareLove', 'tokenPerMessage']));
    } else if (user.type === 'model') {
      data = _.omit(data, userUnPublicData);
    }
      // Add birthday to the public profile
      if (user) {
        data.birthday = user.verificationDocument.birthday;
      }
    return data;
  });

  schema.static('getAvatarUrl', function getAvatarUrl(filePath) {
    if (Helper.String.isUrl(filePath)) {
      return filePath;
    }

    const newFilePath = filePath || 'public/assets/default-avatar.png';
    return Helper.App.getPublicFileUrl(newFilePath);
  });
};
