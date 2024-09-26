const SYSTEM_CONST = require('../../system/constants');

const calculateTokenUnreadMessage = async (option) => {
  const earning = await DB.Earning.aggregate([
    { $match: option },
    {
      $group: {
        _id: null,
        token: { $sum: '$token' },
        balance: { $sum: '$balance' }
      }
    }
  ]);
  if (earning && earning.length) {
    return earning[0];
  }
  return false;
};
exports.calculateTokenUnreadMessage = calculateTokenUnreadMessage;

exports.create = async (option, status = 'approved') => {
  const user = await DB.User.findOne({ _id: option.userId });
  
  if (!user) {
    throw new Error('Fan is not found');
  }

  const model = await DB.User.findOne({ _id: option.modelId });
  if (!model) {
    throw new Error('Model is not found');
  }

  const siteCommision = await DB.Config.findOne({ key: SYSTEM_CONST.SITE_COMMISSION });
  const siteCommisionValue = siteCommision?.value || 0.2;

  const token = option.type === 'send_message' ? model.tokenPerMessage : option.token;
  if (user.role !== 'admin' && user.balance < token) {
    throw new Error('Token is not enough');
  }
  const commissionRate = Number(siteCommisionValue);
  const commission = token * commissionRate;
  const earningData = Object.assign(option, {
    token,
    commission,
    balance: token - commission,
    // TODO - recheck this status
    status
  });
  const earning = new DB.Earning(earningData);
  await earning.save();

  if (status === 'approved') {
    await Service.User.increaseBalance(user._id, -1 * token);
    await Service.User.increaseBalance(model._id, token - commission);
  }

  return true;
};

exports.approvePendingItemWhenModelRespondMessage = async (userId, modelId) => {
  // TODO - should use aggregate?
  const pendingEarning = await DB.Earning.find({
    userId,
    modelId,
    type: 'send_message',
    status: 'pending'
  });

  if (!pendingEarning.length) return;

  let userToken = 0;
  let modelBalance = 0;
  await pendingEarning.reduce(async (lp, earning) => {
    await lp;
    await DB.Earning.updateOne({ _id: earning._id }, {
      $set: {
        status: 'approved'
      }
    });

    userToken += earning.token;
    modelBalance += earning.balance;
    return Promise.resolve();
  }, Promise.resolve());
  await Service.User.increaseBalance(userId, -1 * userToken);
  await Service.User.increaseBalance(modelId, modelBalance);
};
