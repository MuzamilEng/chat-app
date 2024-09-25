const fs = require('fs');
const path = require('path');
const multer = require('multer');
const config = require('../../media/config');

const configController = require('../controllers/config.controller');

const uploadPhoto = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, config.fileDir);
    },
    filename(req, file, cb) {
      const ext = Helper.String.getExt(file.originalname);
      const nameWithoutExt = Helper.String.createAlias(Helper.String.getFileName(file.originalname, true));
      let fileName = `${nameWithoutExt}${ext}`;
      if (fs.existsSync(path.resolve(config.fileDir, fileName))) {
        fileName = `${nameWithoutExt}-${Helper.String.randomString(5)}${ext}`;
      }

      cb(null, fileName);
    },
    fileSize: (30) * 1024 * 1024 // 10MB limit
  })
});

module.exports = (router) => {
  /**
   * @apiDefine configRequest
   * @apiParam {Object}   value        Any value type
   */

  /**
   * @apiGroup System
   * @apiVersion 1.0.0
   * @api {get} /v1/system/configs  Get list configs
   * @apiDescription Get list configs
   * @apiPermission admin
   */
  router.get(
    '/v1/system/configs',
    Middleware.hasRole('admin'),
    configController.list,
    Middleware.Response.success('configs')
  );

  /**
   * @apiGroup System
   * @apiVersion 1.0.0
   * @api {put} /v1/system/configs/:id  Update a config
   * @apiDescription Update a config
   * @apiUse authRequest
   * @apiParam {String}   id        config id
   * @apiUse configRequest
   * @apiPermission admin
   */
  router.put(
    '/v1/system/configs/:id',
    Middleware.hasRole('admin'),
    configController.findOne,
    configController.update,
    Middleware.Response.success('update')
  );

  /**
   * @apiGroup System
   * @apiVersion 1.0.0
   * @api {get} /v1/system/configs
   * @apiPermission all
   */
  router.get('/v1/system/configs/public', configController.publicConfig, Middleware.Response.success('publicConfig'));

  /**
   * @apiGroup System
   * @apiVersion 1.0.0
   * @api {get} /v1/system/configs
   * @apiPermission all
   */
  router.post('/v1/system/configs/keys', configController.publicConfigByKeys, Middleware.Response.success('publicConfig'));

  /**
   * @apiGroup Media
   * @apiVersion 1.0.0
   * @api {post} /v1/media/files  Upload a file
   * @apiDescription Upload a file. Use multipart/form-data to upload file and add additional fields
   * @apiUse authRequest
   * @apiUse photoRequest
   * @apiPermission user
   */
  router.post(
    '/v1/sytem/public/files',
    Middleware.hasRole('admin'),
    uploadPhoto.single('file'),
    configController.base64Upload,
    configController.upload,
    Middleware.Response.success('file')
  );
};
