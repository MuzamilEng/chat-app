/* eslint no-param-reassign: 0 */
const Schema = require('mongoose').Schema;

const schema = new Schema(
  {
    mediaId: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
      index: true,
    },
    userId: {
      // modelId / ownerId
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      index: true,
    },
    name: {
      type: String,
      default: ''
    },
    category: {
      type: String
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
    },
    free: {
      type: Boolean,
      default: false
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    mediaType: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo',
      index: true
    },
    createdAt: {
      type: Date
    },
    updatedAt: {
      type: Date
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

schema.virtual('folder', {
  ref: 'Folder',
  localField: 'folderId',
  foreignField: '_id',
  justOne: true,
});

schema.virtual('media', {
  ref: 'Media',
  localField: 'mediaId',
  foreignField: '_id',
  justOne: true
});

schema.virtual('model', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

schema
  .virtual('isPurchased')
  .set(function setVal(val) {
    this._isPurchased = val;
  })
  .get(function getVal() {
    return this._isPurchased || false;
  });

schema
  .virtual('purchasedItem')
  .set(function setVal(val) {
    this._purchasedItemId = val;
  })
  .get(function getVal() {
    return this._purchasedItemId || null;
  });

module.exports = schema;
