const conversationController = require('../controllers/conversation.controller');

module.exports = (router) => {
  /**
   * @apiGroup Conversation
   * @apiVersion 1.0.0
   * @api {post} /v1/conversation Create or get conversation
   * @apiDescription Create or get conversation
   * @apiParam {String}   [type] `private`
   * @apiParam {String}   recipientId
   * @apiPermission user
   */
  router.post(
    '/v1/conversation',
    Middleware.isAuthenticated,
    conversationController.create,
    Middleware.Response.success('conversation')
  );

  /**
   * @apiGroup Conversation
   * @apiVersion 1.0.0
   * @api {get} /v1/conversation&take&type&sort&sortType Get list
   * @apiDescription Get list conversation
   * @apiPermission user
   */
  router.get(
    '/v1/conversation',
    Middleware.isAuthenticated,
    conversationController.list,
    Middleware.Response.success('list')
  );
// findConversationByMembers

router.get(
  '/v1/conversation/findConversationByMembers',
  Middleware.isAuthenticated,
  conversationController.findConversationByMembers,
  Middleware.Response.success('findConversationByMembers')
);
  /**
   * @apiGroup Conversation
   * @apiVersion 1.0.0
   * @api {post} /v1/conversation/:conversationId/block Block user
   * @apiDescription
   * @apiPermission user
   */
  router.post(
    '/v1/conversation/:conversationId/block',
    Middleware.isAuthenticated,
    conversationController.block,
    Middleware.Response.success('block')
  );


  router.post(
    '/v1/deductbalance',
    Middleware.isAuthenticated,
    conversationController.deductUserBalance,
    Middleware.Response.success('deductUserBalance')
  );
  /**
   * @apiGroup Conversation
   * @apiVersion 1.0.0
   * @api {post} /v1/conversation/:conversationId/unblock Unblock user
   * @apiDescription
   * @apiPermission user
   */
  router.post(
    '/v1/conversation/:conversationId/unblock',
    Middleware.isAuthenticated,
    conversationController.unblock,
    Middleware.Response.success('unblock')
  );

  /**
   * @apiGroup Conversation
   * @apiVersion 1.0.0
   * @api {get} /v1/conversation/:conversationId/recipient Get recipient
   * @apiDescription Get recipient of conversation
   * @apiPermission user
   */
  router.get(
    '/v1/conversation/:conversationId/recipient',
    Middleware.isAuthenticated,
    conversationController.getRecipient,
    Middleware.Response.success('recipient')
  );

  /**
   * @apiGroup Conversation
   * @apiVersion 1.0.0
   * @api {post} /v1/conversation/:conversationId/read Set read status for conversation
   * @apiDescription Set read status for conversation
   * @apiParam {String}   conversationId
   * @apiPermission user
   */
  router.post(
    '/v1/conversation/:conversationId/read',
    Middleware.isAuthenticated,
    conversationController.read,
    Middleware.Response.success('read')
  );

  /**
   * @apiGroup Conversation
   * @apiVersion 1.0.0
   * @api {delete} /v1/conversation/:conversationId/ Delete conversation
   * @apiDescription Delete conversation
   * @apiPermission user
   */
  router.delete(
    '/v1/conversation/:conversationId',
    Middleware.isAuthenticated,
    conversationController.remove,
    Middleware.Response.success('remove')
  );

  router.get(
    '/v1/conversation/total-unread-message',
    Middleware.isAuthenticated,
    conversationController.loadTotalUnreadMessage,
    Middleware.Response.success('totalUnreadMessage')
  );

  router.get(
    '/v1/conversation/:conversationId',
    Middleware.isAuthenticated,
    conversationController.findOne,
    Middleware.Response.success('conversation')
  );
};
