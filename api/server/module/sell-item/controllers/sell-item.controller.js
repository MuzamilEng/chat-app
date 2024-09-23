const Joi = require('joi');
const _ = require('lodash');
const Folder = require('../models/folder');

exports.createSellItem = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      mediaId: Joi.string().allow('', String).optional(),
      price: Joi.number().min(0).allow('', null).optional(),
      free: Joi.boolean().allow('', String).optional(),
      name: Joi.string().min(2).max(500).allow('', String).optional(),
      description: Joi.string().allow('', String).optional(),
      mediaType: Joi.string().allow('photo', 'video').allow('', String).optional(),
      folderId: Joi.string().required(),
      isApproved: Joi.boolean().default(false),
      category: Joi.string().required(),
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    if (req.user.type !== 'model') {
      return next(PopulateResponse.forbidden());
    }
    const media = await DB.Media.findOne({ _id: validate.value.mediaId });
    if (!media) {
      return next(PopulateResponse.notFound());
    }

    const sellItem = new DB.SellItem({
      userId: req.user._id,
      folderId: validate.value.folderId,
      ...validate.value
    });
    await sellItem.save();
    res.locals.create = sellItem;
    return next();
  } catch (error) {
    return next(error);
  }
};


exports.search = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    // Populate the query based on the request parameters
    const query = Helper.App.populateDbQuery(req.query, {
      equal: ['userId', 'mediaType', 'isApproved']
    });

    // Add a condition to exclude documents without userId
    query.userId = { $exists: true, $ne: null };

    // Populate the sort parameters based on the request parameters
    const sort = Helper.App.populateDBSort(req.query);

    // Count the number of documents matching the query
    const count = await DB.SellItem.countDocuments(query);

    // Find the documents matching the query with pagination and sorting
    const items = await DB.SellItem.find(query)
      .populate({
        path: 'media',
        select:
          req.query.userId !== req.user._id.toString()
            ? 'name userId thumbPath blurPath filePath type uploaderId systemType _id'
            : ''
      })
      .populate('model')
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    // Transform the items to include the public profile of the model
    res.locals.search = {
      count,
      items: items.map((item) => {
        const data = item.toObject();
        data.model = item.model ? item.model.getPublicProfile() : {};
        return data;
      })
    };

    return next();
  } catch (e) {
    return next(e);
  }
};


exports.update = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      price: Joi.number().min(0).required(),
      free: Joi.boolean().required(),
      name: Joi.string().min(2).max(500).required(),
      description: Joi.string().allow('', String).optional(),
      isApproved: Joi.boolean().optional()
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    const newData = req.user.role === 'admin' ? validate.value : _.omit(validate.value, ['isApproved']);
    _.merge(req.sellItem, newData);
    await req.sellItem.save();

    res.locals.update = req.sellItem;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.itemId;
    if (!id) {
      return next(PopulateResponse.notFound());
    }
    let sellItem = null;
    if (req.user.role === 'admin') {
      sellItem = await DB.SellItem.findOne({ _id: id }).populate('media').populate('model');
      sellItem.media = await Service.Media.populateAuthRequest({ media: sellItem.media, user: req.user });
    } else if (req.user.role !== 'admin' && req.user.type === 'model') {
      sellItem = await DB.SellItem.findOne({ _id: id, userId: req.user._id }).populate('media');
      sellItem.media = await Service.Media.populateAuthRequest({ media: sellItem.media, user: req.user });
    } else if (req.user.role !== 'admin' && req.user.type === 'user') {
      sellItem = await DB.SellItem.findOne({ _id: id });
    }

    if (!sellItem) {
      return next(PopulateResponse.notFound());
    }

    res.locals.sellItem = sellItem;
    req.sellItem = sellItem;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const sellItem = await DB.SellItem.findOne({ _id: req.params.itemId });
    if (!sellItem) {
      return next(PopulateResponse.notFound());
    }
    if (req.user.role !== 'admin' && sellItem.userId.toString() !== req.user._id.toString()) {
      return next(PopulateResponse.forbidden());
    }
    await Service.SellItem.checkAndRemoveRelatedData(sellItem);
    await sellItem.remove();

    res.locals.remove = PopulateResponse.success({ message: 'Sell item is removed' }, 'SELL_ITEM_REMOVED');
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.validatePermission = async (req, res, next) => {
  if (
    req.user.role !== 'admin'
    && (req.user.type !== 'model' || req.user._id.toString() !== req.sellItem.userId.toString())
  ) {
    return next(PopulateResponse.forbidden());
  }

  return next();
};

exports.mySellItem = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;
  try {
    if (req.user.type !== 'model') {
      return next(PopulateResponse.forbidden());
    }

    // Fetch folders for the user
    const folders = await Folder.find({ userId: req.user._id }).exec();

    // Fetch SellItems and associated media for each folder
    const foldersWithItems = await Promise.all(
      folders.map(async (folder) => {
        const sellItems = await DB.SellItem.find({
          folderId: folder._id,
          mediaType: req.query.mediaType,
          isApproved: true
        }).populate('media').sort({ createdAt: -1 }).skip(page * take).limit(take).exec();

        return {
          ...folder.toObject(),
          sellItems,
        };
      })
    );

    // Flatten sell items to compute the count
    const allSellItems = foldersWithItems.flatMap(folder => folder.sellItems);
    const count = allSellItems.length;

    // Response structure
    res.locals.mySellItem = {
      count,
      folders: foldersWithItems,
    };
    return next();
  } catch (e) {
    return next(e);
  }
};
//  /pending-videoItem/me

exports.myPendingItem = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;
  try {
    if (req.user.type !== 'model') {
      return next(PopulateResponse.forbidden());
    }

    // Fetch folders for the user
    const folders = await Folder.find({ userId: req.user._id }).exec();

    // Fetch SellItems and associated media for each folder
    const foldersWithItems = await Promise.all(
      folders.map(async (folder) => {
        const sellItems = await DB.SellItem.find({
          folderId: folder._id,
          mediaType: req.query.mediaType,
          isApproved: false
        }).populate('media').sort({ createdAt: -1 }).skip(page * take).limit(take).exec();

        return {
          ...folder.toObject(),
          sellItems,
        };
      })
    );

    // Flatten sell items to compute the count
    const allSellItems = foldersWithItems.flatMap(folder => folder.sellItems);
    const count = allSellItems.length;
   console.log(foldersWithItems, "images");
    // Response structure
    res.locals.myPendingItem = {
      count,
      folders: foldersWithItems,
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.myPendingVideoItem = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;
  try {
    if (req.user.type !== 'model') {
      return next(PopulateResponse.forbidden());
    }

    // Fetch folders for the user
    const folders = await Folder.find({ userId: req.user._id }).exec();

    // Fetch SellItems and associated media for each folder
    const foldersWithItems = await Promise.all(
      folders.map(async (folder) => {
        const sellItems = await DB.SellItem.find({
          folderId: folder._id,
          mediaType: req.query.mediaType,
          isApproved: false
        }).populate('media').sort({ createdAt: -1 }).skip(page * take).limit(take).exec();

        return {
          ...folder.toObject(),
          sellItems,
        };
      })
    );

    // Flatten sell items to compute the count
    const allSellItems = foldersWithItems.flatMap(folder => folder.sellItems);
    const count = allSellItems.length;
    // Response structure
    res.locals.myPendingVideoItem = {
      count,
      folders: foldersWithItems,
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.modelSellItem = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;
  try {
    // if (req.user.type !== 'user') {
    //   return next(PopulateResponse.forbidden());
    // }

    const count = await DB.SellItem.count({
      userId: req.query.modelId,
      mediaType: req.query.mediaType,
      isApproved: true
    });
    const items = await DB.SellItem.find({
      ownerId: req.query.modelId,
      mediaType: req.query.mediaType,
      isApproved: true
    })
      .populate('media')
      .sort({ createdAt: -1 })
      .skip(page * take)
      .limit(take)
      .exec();

    // todo - find and populate purchase item data
    const sellItemIds = items.map((item) => item._id);
    const purchaseItems = await DB.PurchaseItem.find({
      userId: req.user._id,
      sellItemId: {
        $in: sellItemIds
      }
    });
    const data = await Promise.all(items.map((item) => {
      item.set('isPurchased', purchaseItems.find((p) => p.sellItemId.toString() === item._id.toString()) !== undefined);
      item.set(
        'purchasedItem',
        purchaseItems.find((p) => (p.sellItemId.toString() === item._id.toString() ? p : null))
      );

      return item;
    }));

    res.locals.modelSellItem = {
      count,
      items: data
    };
    return next();
  } catch (e) {
    console.log(e);
    return next(e);
  }
};


exports.modelSellItems = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;
  try {
    // Retrieve folders for the specified model
    const folders = await Folder.find({ userId: req.query.modelId  || '6683cce9a5e475a6ac5c0731' });
    // Get count of sell items that are approved
    const count = await DB.SellItem.count({
      userId: req.query.modelId  || '6683cce9a5e475a6ac5c0731',
      mediaType: req.query.mediaType,
      isApproved: true
    });

    // Initialize variables to store results
    let totalPhotoCount = 0;
    let totalVideoCount = 0;
    let photos = [];
    let videos = [];

    const foldersWithImages = await Promise.all(
      folders.map(async (folder) => {
        // Retrieve sell items for each folder
        const sellItems = await DB.SellItem.find({
          folderId: folder._id,
          mediaType: req.query.mediaType,
          isApproved: true
        }).populate('media').sort({ createdAt: -1 }).skip(page * take).limit(take).exec();

        const photoItems = sellItems.filter(item => item.mediaType === 'photo');
        const videoItems = sellItems.filter(item => item.mediaType === 'video');

        photos = [...photos, ...photoItems];
        videos = [...videos, ...videoItems];

        totalPhotoCount += photoItems.length;
        totalVideoCount += videoItems.length;

        // Find and populate purchase item data for each sell item
        const sellItemIds = sellItems.map(item => item._id);
        const purchaseItems = await DB.PurchaseItem.find({
          userId: req.user._id,
          sellItemId: {
            $in: sellItemIds
          }
        });

        const data = sellItems.map(item => {
          item.set('isPurchased', purchaseItems.some(p => p.sellItemId.toString() === item._id.toString()));
          item.set('purchasedItem', purchaseItems.find(p => p.sellItemId.toString() === item._id.toString()));

          return item;
        });

        return {
          ...folder.toObject(),
          sellItems: data,
        };
      })
    );

    res.locals.modelSellItem = {
      count,
      folders: foldersWithImages,
      totalPhotoCount,
      totalVideoCount
    };
    return next();
  } catch (e) {
    console.log(e);
    return next(e);
  }
};

exports.modelDefaultSellItems = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;
  try {
    // Retrieve folders for the specified model
    const folders = await Folder.find({ userId: req.query.modelId  || '6683cce9a5e475a6ac5c0731' });
    console.log(folders, "folders");

    // Get count of sell items that are approved
    const count = await DB.SellItem.count({
      userId: req.query.modelId  || '6683cce9a5e475a6ac5c0731',
      mediaType: req.query.mediaType,
      isApproved: true
    });

    // Initialize variables to store results
    let totalPhotoCount = 0;
    let totalVideoCount = 0;
    let photos = [];
    let videos = [];

    const foldersWithImages = await Promise.all(
      folders.map(async (folder) => {
        // Retrieve sell items for each folder
        const sellItems = await DB.SellItem.find({
          folderId: folder._id,
          mediaType: req.query.mediaType,
          isApproved: true
        }).populate('media').sort({ createdAt: -1 }).skip(page * take).limit(take).exec();

        const photoItems = sellItems.filter(item => item.mediaType === 'photo');
        const videoItems = sellItems.filter(item => item.mediaType === 'video');

        photos = [...photos, ...photoItems];
        videos = [...videos, ...videoItems];

        totalPhotoCount += photoItems.length;
        totalVideoCount += videoItems.length;

        // Find and populate purchase item data for each sell item
        const sellItemIds = sellItems.map(item => item._id);
        const purchaseItems = await DB.PurchaseItem.find({
          userId: req?.user?._id || '66c7477dff96c6486ffc6325',
          sellItemId: {
            $in: sellItemIds
          }
        });

        const data = sellItems.map(item => {
          item.set('isPurchased', purchaseItems.some(p => p.sellItemId.toString() === item._id.toString()));
          item.set('purchasedItem', purchaseItems.find(p => p.sellItemId.toString() === item._id.toString()));

          return item;
        });    

        return {
          ...folder.toObject(),
          sellItems: data,
        };
      })
    );

    res.locals.modelDefaultSellItems = {
      count,
      folders: foldersWithImages,
      totalPhotoCount,
      totalVideoCount
    };
    return next();
  } catch (e) {
    console.log(e);
    return next(e);
  }
};

// modelDefaultSellItems
// blogs posts 
exports.createBlogPost = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      mediaId: Joi.string().allow('', String).optional(),
      name: Joi.string().min(2).max(500).allow('', String).optional(),
      description: Joi.string().allow('', String).optional(),
      mediaType: Joi.string().allow('photo', 'video').allow('', String).optional(),
      type: Joi.string().allow('blog', 'post').allow('', String).optional(),
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    if (req.user.type !== 'model') {
      return next(PopulateResponse.forbidden());
    }
    const media = await DB.Media.findOne({ _id: validate.value.mediaId });
    if (!media) {
      return next(PopulateResponse.notFound());
    }

    const blogItem = new DB.SellItem({
      userId: req.user._id,
      type: "blog",
      ...validate.value
    });
    await blogItem.save();
    res.locals.createBlogPost = blogItem;
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.getAllBlogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return next(PopulateResponse.validationError({ message: 'User ID is required' }));
    }
    const blogs = await DB.SellItem.find({ userId, type: "blog" }).populate('media');
    if (!blogs.length) {
      return next(PopulateResponse.notFound());
    }
    res.json({
      code: 200,
      message: 'OK',
      data: blogs
    });
  } catch (error) {
    return next(error);
  }
};



exports.getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(PopulateResponse.validationError({ message: 'Blog ID is required' }));
    }

    const blog = await DB.SellItem.findById(id).populate('media');
    if (!blog) {
      return next(PopulateResponse.notFound());
    }

    res.json({
      code: 200,
      message: 'OK',
      data: blog
    }); 
    // return next();
  } catch (error) {
    return next(error);
  }
};

exports.test = async (req, res) => {
  try {
    console.log('test controller');
    res.status(200).json({ message: 'Test controller works!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// model likes controller

exports.updateLikes = async (req, res, next) => {
  try {
    const { userId, mediaId } = req.body; // Assuming userId is passed in the request body to track the user's like status

    if (!mediaId || !userId) {
      return res.status(400).json({ error: 'Invalid request, mediaId and userId are required' });
    }

    // Find the media by mediaId
    const media = await DB.Media.findOne({ _id: mediaId });
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Check if the user has already liked the media
    const userAlreadyLiked = media.likedBy.includes(userId);

    if (userAlreadyLiked) {
      // If the user has already liked the media, unlike it by decreasing the count and removing the user from the likedBy array
      media.likeCount = Math.max(media.likeCount - 1, 0); // Ensure the like count doesn't go below zero
      media.likedBy = media.likedBy.filter(id => id !== userId);
    } else {
      // If the user hasn't liked the media yet, like it by increasing the count and adding the user to the likedBy array
      media.likeCount += 1;
      media.likedBy.push(userId);
    }

    // Save the updated media document
    await media.save();

    res.locals.updateLikes = {
      success: true,
      message: userAlreadyLiked ? 'Like removed' : 'Like added',
      likeCount: media.likeCount,
    };

    return next();
  } catch (e) {
    return next(e);
  }
};


// get all liked media
exports.getLikedMedia = async (req, res, next) => {
  try {
    const likedMedia = await DB.Media.find();
  
   const likedVideos = likedMedia.filter((media)=> media.type === 'video').sort((a, b) => a.likeCount < b.likeCount ? 1 : -1);
    if (!likedMedia.length) {
      return next(PopulateResponse.notFound());
    }
    res.locals.getLikedMedia = {
      code: 200,
      message: 'OK',
      data: likedVideos
    }
    return next();
  } catch (error) {
    return next(error);
  }
}


// friend request controller-----

exports.sendFriendRequest = async (req, res, next) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ error: 'Invalid request, userId and friendId are required' });
    }

    // Find the user by userId
    const user = await DB.User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const firendObj = {
      friendId: friendId,
      senderId : userId,
      status: 'pending',
    }
    let message = '';
    // Check if the user has already sent a friend request to the friendId
    const friendRequestExists = user.friendRequests.some(request => request.friendId === friendId);

    if (friendRequestExists) {
      message = 'friend request already exists'
      // If the user has already sent a friend request, ignore it
      return res.status(200).json({ success: false, message: 'Friend request already sent' });
    }
    message = 'friend request sent'
    // Add the friendId to the user's friendRequests array
    user.friendRequests.push(firendObj);

    // Save the updated user document
    await user.save();

    res.locals.sendFriendRequest = {
      success: true,
      message: message,
    };
    return next();
  } catch (e) {
    return next(e);
  }
};





// update friend request status
exports.updateFriendRequest = async (req, res, next) => {
  try {
    const { userId, friendId, status } = req.body;
    
    if (!userId || !friendId || !status) {
      return res.status(400).json({ error: 'Invalid request, userId, friendId, and status are required' });
    }

    // Find the user
    const user = await DB.User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the index of the matching friend request
    const friendRequestIndex = user.friendRequests.findIndex(request => 
      (request.friendId.toString() === friendId || request.senderId.toString() === friendId) &&
      (request.friendId.toString() === userId || request.senderId.toString() === userId)
    );

    if (friendRequestIndex === -1) {
      return res.status(404).json({ error: 'Friend request not found or does not match criteria' });
    }

    // Update the status of the matching friend request
    user.friendRequests[friendRequestIndex].status = status;

    // Save the updated user document
    await user.save();

    res.locals.updateFriendRequest = {
      success: true,
      message: `Friend request status updated to ${status}`,
    };
    return next();
  } catch (error) {
    return next(error);
  }
};
;




// get all friend requests
exports.getAllFriendRequests = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'Invalid request, userId is required' });
    }

    // Find all users
    const users = await DB.User.find();
    
    // Initialize an array to collect all matching friend requests
    let matchingFriendRequests = [];

    // Loop through each user and check their friend requests
    for (const user of users) {
      for (const request of user.friendRequests) {
        // Check if userId matches either friendId or senderId in any request
        if (request.friendId.toString() === userId || request.senderId.toString() === userId) {
          // Find the friend and sender based on their IDs
          const friend = await DB.User.findOne({ _id: request.friendId }).select('username email avatar type');
          const sender = await DB.User.findOne({ _id: request.senderId }).select('username email avatar type');

          // Push the matching request with friend and sender details
          matchingFriendRequests.push({
            userId: user._id,
            friendId: friend,
            senderId: sender,
            status: request.status,
            _id: request._id
          });
        }
      }
    }

    // If no matching friend requests are found
    if (matchingFriendRequests.length === 0) {
      return res.status(404).json({ error: 'No friend requests found for this user' });
    }

    // Return the matching friend requests
    res.locals.getAllFriendRequests = {
      code: 200,
      message: 'OK',
      data: matchingFriendRequests,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};



// update interests controller 
exports.updateInterests = async (req, res, next) => {
  try {
    const {userId, interests, languages, hobbies, preferences } = req.body;
    // Fetch the user either by id or the current user in session
    const user = await DB.User.findOne({ _id: userId })

    if (!user) {
      return next(PopulateResponse.notFound());
    }


    user.interests = interests;
    user.languages = languages;
    user.hobbies = hobbies;
    user.preferences = preferences;

    // Save the updated user record
    await user.save();

    // Respond with the updated user
    res.locals.updateInterests = user;
    return next();
  } catch (e) {
    return next(e);
  }
};




// get profile video

exports.getProfileVideo = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'Invalid request, userId is required' });
    }
// i want to get only that video whose name = 'profile-video'
    const userVideo = await DB.Media.findOne({ ownerId : userId , name: 'profile-video' })

    if (!userVideo) {
      return res.status(404).json({ error: 'No profile video found for this user' });
    }
    res.locals.getProfileVideo = {
      data: userVideo
    }
    return next();

  } catch (error) {
    return next(error);
  }

}