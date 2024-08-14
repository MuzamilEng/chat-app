const messageController = require('../controllers/message.controller');

module.exports = (router) => {
  /**
   * @apiDefine messageRequest
   * @apiParam {String}   type `text` or `file`
   * @apiParam {String}   conversationId message group id
   * @apiParam {String}   [text] text message
   * @apiParam {String}   [fileIds] uuid of file from Media module
   */

  /**
   * @apiGroup Message
   * @apiVersion 1.0.0
   * @api {get} /v1/messages/latest?:page&:take&:q Get latest messages
   * @apiDescription Get list messages with sender is not current user
   * @apiParam {String}   [q] Search keyword, will search by text
   * @apiPermission user
   */
  router.get(
    '/v1/messages/latest',
    Middleware.isAuthenticated,
    messageController.latest,
    Middleware.Response.success('latest')
  );

  /**
   * @apiGroup Message
   * @apiVersion 1.0.0
   * @api {post} /v1/messages  Create a new message
   * @apiDescription Create new message
   * @apiUse authRequest
   * @apiUse messageRequest
   * @apiPermission user
   */
  router.post(
    '/v1/messages',
    Middleware.isAuthenticated,
    messageController.create,
    Middleware.Response.success('create')
  );

  /**
   * @apiGroup Message
   * @apiVersion 1.0.0
   * @api {delete} /v1/messages/:messageId  Delete a message
   * @apiUse authRequest
   * @apiUse messageRequest
   * @apiPermission user
   */
  router.delete(
    '/v1/messages/:messageId',
    Middleware.isAuthenticated,
    messageController.remove,
    Middleware.Response.success('remove')
  );

  /**
   * @apiGroup Message
   * @apiVersion 1.0.0
   * @api {get} /v1/messages/all-messages/:conversationId?:page&:take&:q Get list messages by group
   * @apiDescription Get list messages by group
   * @apiParam {String}   [q] Search keyword, will search by text
   * @apiPermission user
   */
  router.get(
    '/v1/messages/all-messages',
    Middleware.hasRole('admin'),
    messageController.allMessage,
    Middleware.Response.success('all')
  );


  router.get(
    '/v1/messages/all-message/:conversationId',
    Middleware.hasRole('admin'),
    messageController.getAllMessagesByConversationId,
    Middleware.Response.success('getAllMessagesByConversationId')
  );
  /**
   * @apiGroup Message
   * @apiVersion 1.0.0
   * @api {get} /v1/messages/:conversationId?:page&:take&:q Get list messages by conversation
   * @apiDescription Get list messages by conversation
   * @apiParam {String}   [q] Search keyword, will search by text
   * @apiPermission user
   */
  router.get(
    '/v1/messages/:conversationId',
    Middleware.isAuthenticated,
    messageController.search,
    Middleware.Response.success('search')
  );

  /**
   * @apiDescription Add Bookmark
   * @Payload {string} messageId
   */
  router.post(
    '/v1/messages/bookmark',
    Middleware.isAuthenticated,
    messageController.bookmark,
    Middleware.Response.success('bookmark')
  );

  /**
   * @apiDescription Delete Bookmark
   * @apiParams {string} bookmarkId
   */
  router.delete(
    '/v1/messages/bookmark/:bookmarkId',
    Middleware.isAuthenticated,
    messageController.unbookmark,
    Middleware.Response.success('bookmark')
  );

  /**
   * @apiDescription Get list all bookmark by user
   * @apiGroup Message
   * @apiVersion 1.0.0
   * @api {get} /v1/messages/bookmark/?:page&:take&:q Get list bookmark by user
   * @apiPermission user
   */
  router.get(
    '/v1/messages/bookmark/search',
    Middleware.isAuthenticated,
    messageController.searchBookmarkMessage,
    Middleware.Response.success('search')
  );
};
