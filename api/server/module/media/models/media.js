/* eslint no-param-reassign: 0 */
const Schema = require('mongoose').Schema;

const schema = new Schema(
  {
    // uploader or owner?
    uploaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    name: {
      type: String
    },
    description: {
      type: String
    },
    type: {
      type: String,
      index: true
    },
    systemType: {
      type: String,
      index: true,
      enum: ['message', 'sell-item'] // old data will have null and profile-photo
    },
    convertStatus: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'done'
    },
    mimeType: {
      type: String
    },
    uploaded: {
      type: Boolean,
      default: true
    },
    // create thumb, medium and large photo - optimize for speed
    originalPath: {
      type: String
    },
    filePath: {
      type: String
    },
    mediumPath: {
      type: String
    },
    thumbPath: {
      type: String
    },
    blurPath: {
      type: String
    },
    size: {
      type: String
    },
    meta: {
      type: Schema.Types.Mixed
    },
    likeCount: { 
      type: Number,
      default: 0
    },
    likedBy: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      default: [] 
    }],
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
      virtuals: true,
      transform(doc, ret) {
        ret.fileUrl = ret.filePath ? Helper.App.getPublicFileUrl(ret.filePath) : ret.originalPath;
        ret.mediumUrl = Helper.App.getPublicFileUrl(ret.mediumPath);
        ret.thumbUrl = Helper.App.getPublicFileUrl(ret.thumbPath);
        ret.blurUrl = Helper.App.getPublicFileUrl(ret.blurPath);
      }
    }
  }
);

schema.virtual('fileUrl').get(() => (this.filePath ? Helper.App.getPublicFileUrl(this.filePath) : this.originalPath));

schema.virtual('mediumUrl').get(() => Helper.App.getPublicFileUrl(this.mediumPath));

schema.virtual('thumbUrl').get(() => Helper.App.getPublicFileUrl(this.thumbPath));

schema.virtual('blurUrl').get(() => Helper.App.getPublicFileUrl(this.blurPath));

schema.method('toJSON', function toJSON() {
  const data = this.toObject();

  delete data.filePath;
  delete data.mediumPath;
  delete data.thumbPath;
  delete data.blurPath;
  delete data.originalPath;

  return data;
});

schema.method('getPublic', function getPublic() {
  const data = this.toObject();
  delete data.filePath;
  delete data.mediumPath;
  delete data.thumbPath;
  delete data.blurPath;
  delete data.originalPath;

  return data;
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

  schema
  .virtual('isFree')
  .set(function setVal(val) {
    this._isFreeId = val;
  })
  .get(function getVal() {
    return this._isFreeId || false;
  });
  schema
  .virtual('sellItemId')
  .set(function setVal(val) {
    this._sellItemId = val;
  })
  .get(function getVal() {
    return this._sellItemId || null;
  });
  schema
  .virtual('price')
  .set(function setVal(val) {
    this._price = val;
  })
  .get(function getVal() {
    return this._price || null;
  });
module.exports = schema;
