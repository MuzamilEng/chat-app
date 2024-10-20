/* eslint no-param-reassign: 0, import/no-unresolved: 0, no-restricted-syntax: 0, no-await-in-loop: 0, no-loop-func: 0 */
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const jwt = require('jsonwebtoken');
const omit = require('lodash');
const SocketRedis = require('./SocketRedis');

let socketio;

exports.setup = async (httpServer) => {
  socketio = require('socket.io')(httpServer, {
    cors: {
      origin: "*",  // Replace with your production domain
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Authorization'],
      credentials: true
    }
  });

  // config authorization
  socketio.use(async (socket, next) => {
    // verity jwt and bin user data into socket object
    // then we can use these data through the app
    const handshakeData = socket.request;
    if (!handshakeData._query || !handshakeData._query.token) {
      socket.emit('disconnected', { code: 422, msg: 'Missing auth token!' });
      return next(new Error('Missing auth token!'));
    }

    try {
      const decoded = jwt.verify(handshakeData._query.token, process.env.SESSION_SECRET);
      const user = await DB.User.findOne({ _id: decoded._id });
      if (!user) {
        socket.emit('disconnected', {
          code: 500,
          msg: 'Server error or record not found!'
        });
        return next(new Error('Server error or record not found!'));
      }
      socket.user = user.toObject();
      return next();
    } catch (err) {
      socket.emit('disconnected', {
        code: 400,
        msg: 'Token is expired!'
      });
      return next(err);
    }
  });

  // allow origin
  // TODO - get from config
  // TODO - recheck CORS here
  // socketio.origins('*:*');

  const pubClient = createClient({ url: process.env.REDIS_URL });
  await pubClient.connect();
  const subClient = pubClient.duplicate();

  socketio.adapter(createAdapter(pubClient, subClient));
};

exports.init = async () => {
  socketio.on('connection', async (socket) => {
    try {
      // TODO - if allow guest user, we have to store socket id into redis set
      // then when disconnect event we will check user id in socket and remove related data
      // TODO - add prefix for user if needed
      const userId = socket.user._id.toString();
      const socketId = socket.id;
      // add the user id into redis
      await SocketRedis.addUser(userId);

      // check do we have non-active socket connection for current user and remove it if so
      const socketIds = await SocketRedis.getSocketsFromUserId(userId);
      await Promise.all(socketIds.map((sId) => (socket.adapter.sids[sId] ? true : SocketRedis.removeUserSocketId(userId, sId))));
      await SocketRedis.addUserSocketId(userId, socket.id);
      // TODO - check os connect
      await DB.User.update({ _id: userId }, {
        $set: {
          isOnline: true,
          lastOffline: null,
          lastOnline: new Date()
        }
      });
      // emit connected status to user side?
      // socket.emit('connected', { msg: 'Connected!' });

      socket.on('disconnect', async () => {
        await SocketRedis.removeUserSocketId(userId, socketId);
        // TODO - if allow guest user we have to remove socket ID here (if added into redis)
        // check does user have more connections
        const sIds = await SocketRedis.getSocketsFromUserId(userId);
        if (!sIds || !sIds.length) {
          await SocketRedis.removeUser(userId);
          // TODO - check os disconnect
          await DB.User.update({ _id: userId }, {
            $set: {
              isOnline: false,
              lastOffline: new Date(),
              lastOnline: null
            }
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
  });
};

exports.emitToUsers = async (userId, eventName, data) => {
  if (!socketio) {
    throw new Error('Socket service is not ready yet!');
  }
  const userIds = !Array.isArray(userId) ? [userId] : userId;
  for (const uId of userIds) {
    const id = uId.toString();
    const socketIds = await SocketRedis.getSocketsFromUserId(id);
    socketIds
      .filter((socketId) => {
        if (data.socketId) {
          return socketId !== data.socketId;
        }
        return socketId;
      })
      .forEach((socketId) => socketio.to(socketId).emit(eventName, omit(data, ['socketId'])));
  }
  return true;
};
