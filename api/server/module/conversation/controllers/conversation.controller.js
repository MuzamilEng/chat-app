/* eslint no-param-reassign: 0 */
const Joi = require('joi');
const UserDto = require('../../user/dtos/user.dto');

/**
 * Create a get room if provided
 */
exports.create = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      userId: Joi.string().required()
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    if (req.user._id.toString() === validate.value.userId) {
      return next(PopulateResponse.error({ message: 'Cannot create conversation yourself!' }));
    }

    const user = await DB.User.findOne({ _id: Helper.App.toObjectId(validate.value.userId) });
    if (!user) {
      return next(PopulateResponse.error({ message: 'User is not found' }));
    }

    if (req.user.type === user.type) {
      return next(PopulateResponse.forbidden({ message: "We're sorry. Only users can chat with models." }));
    }

    const query = {
      memberIds: {
        $all: [req.user._id, Helper.App.toObjectId(validate.value.userId)]
      }
    };

    const conversation = await DB.Conversation.findOne(query);
    if (conversation) {
      // ? active the conversation again when user click to chat with model
      // remove deleted by ID
      await Service.Conversation.removeDeleted(conversation, req.user._id);
      res.locals.conversation = conversation;
      return next();
    }

    const newConv = new DB.Conversation(
      Object.assign(validate.value, {
        memberIds: [req.user._id, Helper.App.toObjectId(validate.value.userId)]
      })
    );
    await newConv.save();
    newConv.members = [];
    newConv.members.push(user, req.user);

    await Service.Socket.emitToUsers(Helper.App.toObjectId(validate.value.userId), 'new_conversation', newConv.toObject());
    // await Service.Socket.emitToUsers(req.user._id, 'new_conversation', newConv);

    res.locals.conversation = newConv.toObject();
    //write a logic ashwani
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    const query = {
      memberIds: { $in: [req.user._id] },
      deletedByIds: {
        $nin: [req.user._id]
      }
    };

    const conversations = await DB.Conversation.find(query)
      .populate('members')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();

    // Find conversation meta data of request user
    const conversationIds = conversations.map((conv) => conv._id);
    const userMetaDatas = await DB.ConversationUserMeta.find({
      userId: req.user._id,
      conversationId: { $in: conversationIds }
    });

    const metaOptions = {
      userMetaDatas,
      conversations
    };

    const items = await Service.ConversationUserMeta.mapConversationsAndUserMetaData(metaOptions);

    res.locals.list = {
      count: items.length,
      items
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const conversation = await DB.Conversation.findOne({
      _id: req.params.conversationId,
      memberIds: { $in: [req.user._id] },
      deletedByIds: {
        $nin: [req.user._id]
      }
    })
      .populate('members')
      .populate('lastMessage')
      .exec();

    if (!conversation) throw PopulateResponse.notFound();

    const metaData = await DB.ConversationUserMeta.findOne({
      userId: req.user._id,
      conversationId: conversation._id
    });

    const newData = conversation.toObject();

    const members = (newData.members || []).map((member) => {
      const dto = new UserDto(member);
      return dto.toShortInfo();
    });
    newData.members = members;
    newData.userMetaData = metaData || {};
    newData.unreadMessageCount = metaData?.unreadMessageCount || 0;

    res.locals.conversation = newData;    
    return next();
  } catch (e) {
    return next(e);
  }
};


// deduct balance 
exports.deductUserBalance = async (req, res, next) => {
  try {
    const { userId, tokenPerMessage } = req.body;

    // Find the user by userId
    const user = await DB.User.findOne({ _id: userId }).exec();

    if (!user) throw new Error('User not found');

    // Check if the user's balance is sufficient
    if (user.balance < tokenPerMessage) {
      throw new Error('Insufficient balance');
    }

    // Deduct the tokenPerMessage amount from the user's balance
    user.balance -= tokenPerMessage;

    // Save the updated user balance
    await user.save();

    res.locals.updatedUser = user.toObject(); // Pass the updated user data to the response
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.block = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      blockedId: Joi.string().required()
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    if (req.user._id === validate.value.blockedId) {
      return next(PopulateResponse.error({ message: 'Can\'t block yourself' }));
    }

    await DB.Conversation.update(
      { _id: req.params.conversationId },
      {
        $addToSet: { blockedIds: validate.value.blockedId }
      }
    );

    // send to user is blocked event
    await Service.Socket.emitToUsers(Helper.App.toObjectId(validate.value.blockedId), 'have_been_blocked_event', {
      conversationId: req.params.conversationId,
      blockedId: validate.value.blockedId
    });

    res.locals.block = PopulateResponse.success(
      { message: 'Block conversation is successfully' },
      'CONVERSATION_BLOCKED'
    );
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.unblock = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      blockedId: Joi.string().required()
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    if (req.user._id === validate.value.blockedId) {
      return next(PopulateResponse.error({ message: 'Can\'t unblock yourself' }));
    }

    await DB.Conversation.update(
      { _id: req.params.conversationId },
      {
        $pull: { blockedIds: validate.value.blockedId }
      }
    );

    // send to user is unblocked event
    await Service.Socket.emitToUsers(Helper.App.toObjectId(validate.value.blockedId), 'have_been_unblocked_event', {
      conversationId: req.params.conversationId,
      blockedId: validate.value.blockedId
    });

    res.locals.unblock = PopulateResponse.success(
      { message: 'Unlock conversation is successfully!' },
      'CONVERSATION_UNBLOCKED'
    );
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.getRecipient = async (req, res, next) => {
  try {
    const conversation = await DB.Conversation.findById(req.params.conversationId).exec();
    if (!conversation) {
      return next(PopulateResponse.notFound());
    }

    const recipientId = conversation.memberIds.find((memId) => memId.toString() !== req.user._id.toString());
    if (!recipientId) {
      return next(PopulateResponse.notFound());
    }

    const recipient = await DB.User.findById(recipientId).exec();
    if (!recipient) {
      return next(PopulateResponse.notFound());
    }

    res.locals.recipient = recipient.getPublicProfile();
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const conversation = await DB.Conversation.findOne({ _id: req.params.conversationId });
    if (!conversation) {
      return next(PopulateResponse.notFound());
    }

    // TODO - rehandle here
    const hasMember = conversation.memberIds.findIndex((mId) => mId.toString() === req.user._id.toString());
    if (hasMember === -1) {
      return next(new Error('Forbidden'));
    }

    const hasDeleted = (conversation.deletedByIds || []).findIndex((id) => id.toString() === req.user.toString());
    if (hasDeleted > -1) {
      return next();
    }

    const deletedByIds = [
      ...(conversation.deletedByIds || []),
      req.user._id
    ];
    conversation.deletedByIds = deletedByIds;
    await conversation.save();
    // await conversation.remove();
    // await DB.Message.deleteMany({ conversationId: conversation._id });
    res.locals.remove = PopulateResponse.success(
      { message: 'Remove conversation is successfully!' },
      'CONVERSATION_REMOVED'
    );
    return next();
  } catch (e) {
    return next(e);
  }
};

/** Update unreadmessage count of user's conversation (user meta data) */
exports.read = async (req, res, next) => {
  try {
    const data = await DB.ConversationUserMeta.findOne({
      conversationId: Helper.App.toObjectId(req.params.conversationId),
      userId: req.user._id
    });
    if (data) {
      await data.update({ $set: { unreadMessageCount: 0 } });
    }

    res.locals.read = PopulateResponse.success({}, 'MESSAGE_READED');
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.loadTotalUnreadMessage = async (req, res, next) => {
  try {
    const data = await DB.ConversationUserMeta.aggregate([{
      $match: {
        userId: req.user._id
      }
    },
    {
      $group: {
        _id: '$conversationId',
        totalUnreadMessage: {
          $sum: '$unreadMessageCount'
        }
      }
    }]);

    res.locals.totalUnreadMessage = data && data.length ? data[0].totalUnreadMessage : 0;
    return next();
  } catch (e) {
    return next(e);
  }
};

const cron = require('node-cron');

// Cron job to run every 10 seconds
cron.schedule('*/10 * * * *', async () => {
  console.log('Running cron job to fetch unread messages');

  try {
    const users = await DB.User.find({}); // Fetch all users or a subset of users

    for (const user of users) {
      const data = await DB.ConversationUserMeta.aggregate([{
        $match: {
          userId: user._id
        }
      },
      {
        $group: {
          _id: '$conversationId',
          totalUnreadMessage: {
            $sum: '$unreadMessageCount'
          }
        }
      }]);

      const totalUnreadMessage = data && data.length ? data[0].totalUnreadMessage : 0;

      // Update user's unread message count or send a notification
      await DB.User.updateOne(
        { _id: user._id },
        { totalUnreadMessage: totalUnreadMessage }
      );

      console.log(`User ${user._id} has ${totalUnreadMessage} unread messages`);
    }

  } catch (err) {
    console.error('Error in fetching unread messages:', err);
  }
});


exports.findConversationByMembers = async (req, res, next) => {
  try {
    const { id1, id2 } = req.query;

    if (!id1 || !id2) {
      return res.status(400).json({ error: 'Both member IDs are required' });
    }

    const query = {
      memberIds: { $all: [id1, id2] },
      deletedByIds: { $nin: [id1, id2] }
    };

    const conversation = await DB.Conversation.findOne(query)
      .sort({ updatedAt: -1 })
      .exec();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }    
    // res.locals.conversationId = conversation._id;
    res.status(200).json({ code: 200, message: "OK", error: false, conversationId: conversation._id });

    // return next();
  } catch (e) {
    return next(e);
  }
};
