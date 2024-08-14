const multer = require('multer');

const uploadAvatar = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'public/avatar/');
    },
    filename(req, file, cb) {
      const fileName = Helper.String.randomString(5) + Helper.String.getExt(file.originalname);
      cb(null, fileName);
    },
    fileSize: (process.env.MAX_PHOTO_SIZE || 10) * 1024 * 1024 // 10MB limit
  })
});

const uploadCertification = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'public/protected/certification/');
    },
    filename(req, file, cb) {
      const fileName = Helper.String.randomString(5) + Helper.String.getExt(file.originalname);
      cb(null, fileName);
    },
    fileSize: (process.env.MAX_PHOTO_SIZE || 10) * 1024 * 1024 // 10MB limit
  })
});

const userController = require('../controllers/user.controller');

module.exports = (router) => {
  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users  Create new user
   * @apiDescription Create new user
   * @apiUse authRequest
   * @apiUse userCreateRequst
   * @apiUse userProfileResponse
   * @apiPermission admin
   */
  router.post('/v1/users', Middleware.hasRole('admin'), userController.create, Middleware.Response.success('user'));

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users/:id/avatar  Change user avatar
   * @apiDescription Change user avatar. Use multipart/formdata
   * @apiUse authRequest
   * @apiParam {Object}  avatar file data
   * @apiPermission admin
   */
  router.post(
    '/v1/users/:id/avatar',
    Middleware.hasRole('admin'),
    uploadAvatar.single('file'),
    userController.updateAvatar,
    Middleware.Response.success('updateAvatar')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users/avatar  Change current user avatar
   * @apiDescription Change user avatar. Use multipart/formdata
   * @apiUse authRequest
   * @apiParam {Object}  avatar file data
   * @apiPermission user
   */
  router.post(
    '/v1/users/avatar',
    Middleware.isAuthenticated,
    uploadAvatar.single('file'),
    userController.updateAvatar,
    Middleware.Response.success('updateAvatar')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {put} /v1/users Update current user profile
   * @apiDescription Update profile
   * @apiUse authRequest
   * @apiUse userCreateRequst
   * @apiUse userProfileResponse
   * @apiPermission admin
   */
  router.put('/v1/users', Middleware.hasRole('admin'), userController.update, Middleware.Response.success('update'));

  router.get(
    '/v1/users/findByUsername/:username',
    Middleware.isAuthenticated,
    userController.findByUsername,
    Middleware.Response.success('user')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {put} /v1/users/updateProfile Update profile
   * @apiDescription Update profile
   * @apiUse userProfileResponse
   * @apiPermission user
   */
  router.put(
    '/v1/users/updateProfile',
    Middleware.isAuthenticated,
    userController.updateProfile,
    Middleware.Response.success('update')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {put} /v1/users/deactive Update current user profile
   * @apiDescription User deactive profile yourself
   * @apiUse authRequest
   * @apiPermission user
   */
  router.put(
    '/v1/users/deactive',
    Middleware.isAuthenticated,
    userController.deactiveAccount,
    Middleware.Response.success('deactive')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {put} /v1/users/setting-token Update token per message
   * @apiDescription Update token per message
   * @apiUse authRequest
   * @apiParam {String}   token
   * @apiParam {String}   modelId
   * @apiPermission model
   */

  router.put(
    '/v1/users/token-per-message',
    Middleware.isAuthenticated,
    userController.updateTokenPerMessage,
    Middleware.Response.success('tokenPerMessage')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users/:id Update profile
   * @apiDescription Update profile
   * @apiUse authRequest
   * @apiUse userCreateRequst
   * @apiUse userProfileResponse
   * @apiPermission admin
   */
  router.put(
    '/v1/users/:id',
    Middleware.hasRole('admin'),
    userController.update,
    Middleware.Response.success('update')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/me Get my profile
   * @apiDescription get current profle of logged in user
   * @apiUse authRequest
   * @apiUse userProfileResponse
   * @apiPermission user
   */
  router.get('/v1/users/me', Middleware.isAuthenticated, userController.me, Middleware.Response.success('me'));

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/search?:username&:phoneNumber&:isActive&:emailVerified&:role Search users
   * @apiDescription Search users
   * @apiUse authRequest
   * @apiParam {String}   [name]
   * @apiParam {String}   [phoneNumber]
   * @apiParam {Boolean}  [isActive]
   * @apiParam {Boolean}  [emailVerified]
   * @apiParam {String}   [role]
   *
   * @apiSuccessExample {json} Response-Success
   * {
   *    "code": 200,
   *    "message": "OK",
   *    "data": {
   *        "count": 10,
   *        "items": [
   *            "role": "user",
   *            "provider": "local",
   *            "_id": "5b99da5989b54c53851fa66c",
   *            "type": "user",
   *            "isActive": true,
   *            "emailVerified": false,
   *            "phoneNumber": "",
   *            "address": "",
   *            "email": "tuongtest@yopmail.com",
   *            "createdAt": "2018-09-13T03:32:41.715Z",
   *            "updatedAt": "2018-09-13T03:32:41.715Z",
   *            "__v": 0,
   *            "avatarUrl": "http://url/to/default/avatar.jpg"
   *        ]
   *    },
   *    "error": false
   * }
   * @apiPermission admin
   */

  router.get(
    '/v1/users/search',
    Middleware.isAuthenticated,
    userController.search,
    Middleware.Response.success('search')
  );


  // default search
  router.get(
    '/v1/users/default-search',
    userController.defaultSearch,
    Middleware.Response.success('defaultSearch')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/otp User get OTP
   * @apiDescription User get OTP
   * @apiUse authRequest
   * @apiParam {String}   [id]      user id
   */

  router.get(
    '/v1/users/search-friend',
    Middleware.isAuthenticated,
    userController.searchFriends,
    Middleware.Response.success('search')
  );

  router.get('/v1/users/otp', Middleware.isAuthenticated, userController.getOTP, Middleware.Response.success('getOTP'));

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/:id Get user profile
   * @apiDescription Get public user profile
   * @apiUse authRequest
   * @apiParam {String}   [id]      user id
   * @apiUse userProfileResponse
   * @apiPermission user
   */
  router.get('/v1/users/:id', Middleware.isAuthenticated, userController.findOne, Middleware.Response.success('user'));

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {delete} /v1/users/:id Delete user
   * @apiDescription Delete user profile. just allow for non-admin user
   * @apiUse authRequest
   * @apiParam {String}   [id]      user id
   *
   * @apiSuccessExample {json} Response-Success
   * {
   *    "code": 200,
   *    "message": "OK",
   *    "data": {
   *        "success": true
   *    },
   *    "error": false
   * }
   * @apiPermission admin
   */
  router.delete(
    '/v1/users/:userId',
    Middleware.hasRole('admin'),
    userController.remove,
    Middleware.Response.success('remove')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users/certification/photo  Change current model certification photo
   * @apiDescription Change model certification photo. Use multipart/formdata
   * @apiUse authRequest
   * @apiParam {Object}  certification file data
   *
   * @apiSuccessExample {json} Response-Success
   * {
   *    "code": 200,
   *    "message": "OK",
   *    "data": {
   *        "url": "http://url/to/certification.jpg"
   *    },
   *    "error": false
   * }
   * @apiPermission admin
   */
  router.post(
    '/v1/users/:id/certification/photo',
    Middleware.hasRole('admin'),
    uploadCertification.single('file'),
    userController.updateCertificationPhoto,
    Middleware.Response.success('updateCertificationPhoto')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users/certification/photo  Change current model certification photo
   * @apiDescription Change model certification photo. Use multipart/formdata
   * @apiUse authRequest
   * @apiParam {Object}  certification file data
   *
   * @apiSuccessExample {json} Response-Success
   * {
   *    "code": 200,
   *    "message": "OK",
   *    "data": {
   *        "url": "http://url/to/certification.jpg"
   *    },
   *    "error": false
   * }
   * @apiPermission user
   */
  router.post(
    '/v1/users/certification/photo',
    Middleware.isAuthenticated,
    uploadCertification.single('file'),
    userController.updateCertificationPhoto,
    Middleware.Response.success('updateCertificationPhoto')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {put} /v1/users/verification/document Update verification document
   * @apiDescription Update verification document
   * @apiUse authRequest
   * @apiParam {Object}   verificationDocument
   * @apiParam {String}   type  `ID`, `passport`, `driverCard`
   * @apiUse userProfileResponse
   * @apiPermission user
   */
  router.post(
    '/v1/users/document/',
    Middleware.isAuthenticated,
    userController.updateDocument,
    Middleware.Response.success('document')
  );

  router.put(
    '/v1/users/:id/verification/document/',
    Middleware.hasRole('admin'),
    userController.updateDocument,
    Middleware.Response.success('document')
  );

  router.post('/v1/users/updatePassword', userController.updatePassword, Middleware.Response.success('updatePassword'));
};
