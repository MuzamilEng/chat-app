const fs = require('fs');
const path = require('path');
const multer = require('multer');
const config = require('./config');

const uploadPhoto = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, config.protectPhotoDir);
    },
    filename(req, file, cb) {
      const ext = Helper.String.getExt(file.originalname);
      const nameWithoutExt = Helper.String.createAlias(Helper.String.getFileName(file.originalname, true));
      let fileName = `${nameWithoutExt}${ext}`;
      if (fs.existsSync(path.resolve(config.protectPhotoDir, fileName))) {
        fileName = `${nameWithoutExt}-${Helper.String.randomString(5)}${ext}`;
      }

      cb(null, fileName);
    },
    fileSize: (30) * 1024 * 1024 // 10MB limit
  })
});

const uploadVideo = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, config.protectVideoDir);
    },
    filename(req, file, cb) {
      const ext = Helper.String.getExt(file.originalname);
      const nameWithoutExt = Helper.String.createAlias(Helper.String.getFileName(file.originalname, true));
      let fileName = `${nameWithoutExt}${ext}`;
      if (fs.existsSync(path.resolve(config.protectVideoDir, fileName))) {
        fileName = `${nameWithoutExt}-${Helper.String.randomString(5)}${ext}`;
      }

      cb(null, fileName);
    },
    // allow upto 20MB file size
    fileSize: (30) * 1024 * 1024
    // fileSize: (process.env.MAX_VIDEO_SIZE || 10) * 1024 * 1024 // 10MB limit
  })
});

const uploadFile = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, config.protectFileDir);
    },
    filename(req, file, cb) {
      const ext = Helper.String.getExt(file.originalname);
      const nameWithoutExt = Helper.String.createAlias(Helper.String.getFileName(file.originalname, true));
      let fileName = `${nameWithoutExt}${ext}`;
      if (fs.existsSync(path.resolve(config.protectFileDir, fileName))) {
        fileName = `${nameWithoutExt}-${Helper.String.randomString(5)}${ext}`;
      }

      cb(null, fileName);
    },
    fileSize: (process.env.MAX_FILE_SIZE || 10) * 1024 * 1024 // 10MB limit
  })
});

// the queue
require('./queue');

const photoController = require('./controllers/photo.controller');
const videoController = require('./controllers/video.controller');
const mediaController = require('./controllers/media.controller');

exports.model = {
  Media: require('./models/media')
};

exports.services = {
  Media: require('./services/Media')
};

exports.router = (router) => {
  /**
   * @apiGroup Media
   * @apiVersion 1.0.0
   * @api {post} /v1/media/photos  Upload a photo
   * @apiDescription Upload a photo. Use multipart/form-data to upload file and add additional fields
   * @apiUse authRequest
   * @apiUse photoRequest
   * @apiPermission user
   */
  router.post(
    '/v1/media/photos',
    Middleware.isAuthenticated,
    uploadPhoto.single('file'),
    photoController.base64Upload,
    photoController.upload,
    Middleware.Response.success('photo')
  );

  /**
   * @apiGroup Media
   * @apiVersion 1.0.0
   * @api {get} /v1/media/:itemId/download/:mediaId Download a file
   * @apiDescription Download a file
   * @apiUse authRequest
   * @apiParam {String}  itemId
   * @apiPermission user
   */
  router.get(
    '/v1/media/:mediaId/download',
    Middleware.isAuthenticated,
    mediaController.findOne,
    mediaController.download,
    Middleware.Response.success('download')
  );
  /**
   * @apiGroup Media
   * @apiVersion 1.0.0
   * @api {put} /v1/media/:id Update a media
   * @apiDescription Update a media
   * @apiUse authRequest
   * @apiParam {String}   id        media id
   * @apiParam {String}   name        media name
   * @apiParam {String}   description        media description
   * @apiPermission user
   */
  router.post(
    '/v1/media/edit-photos/:id',
    Middleware.isAuthenticated,
    mediaController.findOne,
    uploadPhoto.single('file'),
    photoController.editPhoto,
    Middleware.Response.success('newPhoto')
  );

  /**
   * @apiGroup Media
   * @apiVersion 1.0.0
   * @api {post} /v1/media/videos  Upload a video
   * @apiDescription Upload a video. Use multipart/form-data to upload file and add additional fields
   * @apiUse authRequest
   * @apiUse photoRequest
   * @apiPermission user
   */
  router.post(
    '/v1/media/videos',
    Middleware.isAuthenticated,
    uploadVideo.single('file'),
    videoController.upload,
    Middleware.Response.success('video')
  );

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
    '/v1/media/files',
    Middleware.isAuthenticated,
    uploadFile.single('file'),
    mediaController.uploadFile,
    Middleware.Response.success('file')
  );

  /**
   * @apiGroup Media
   * @apiVersion 1.0.0
   * @api {get} /v1/media/search?:page&:take&:name&:type&:sort&:sortType Get list media
   * @apiDescription Get list media
   * @apiParam {Number}   [page="1"]
   * @apiParam {Number}   [take="10"]
   * @apiParam {String}   [name]
   * @apiParam {String}   [type] `video`, `photo`...
   * @apiParam {Sring}   [sort="createdAt"]
   * @apiParam {Sring}   [sortType="desc"]
   * @apiPermission user
   */
  router.get(
    '/v1/media/search',
    Middleware.isAuthenticated,
    mediaController.search,
    Middleware.Response.success('search')
  );

  /**
   * @apiGroup Media
   * @apiVersion 1.0.0
   * @api {get} /v1/media/protected/ Update a media
   * @apiDescription Check permission of user request a media
   * @apiUse authRequest
   * @apiParam {String}   url        the media url, it maybe a thumbpath, mediaPath, filePath or originalPath
   * @apiPermission user
   */
  router.get('/v1/media/authorization', mediaController.mediaAuth, Middleware.Response.success('protected'));
};
