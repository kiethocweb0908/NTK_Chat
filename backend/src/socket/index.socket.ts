import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { Env } from '../config/env.config';
import app from '../app';
import { socketAuthMiddleware } from '../middlewares/socket.middleware';
import { getUserConversationsForSocketIO } from '../controllers/conversation.controller';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const onlineUsers = new Map<string, string>(); //{userId, socketId}

const getSocketIdByUserId = (userId: string) => {
  return onlineUsers.get(userId);
};

io.on('connection', async (socket) => {
  const user = socket.user;

  if (!user?._id) {
    console.log('Không tìm thấy UserId, ngắt kết nối socket.');
    return socket.disconnect();
  }

  const userId = user._id.toString();
  console.log(`${user?.displayName} online với ${socket.id}`);

  onlineUsers.set(user?._id.toString(), socket.id);
  io.emit('online-users', Array.from(onlineUsers.keys()));

  const conversationIds = await getUserConversationsForSocketIO(userId);
  conversationIds.forEach((id) => socket.join(id));

  socket.on('disconnect', () => {
    onlineUsers.delete(user?._id.toString());
    io.emit('online-users', Array.from(onlineUsers.keys()));
    console.log(`socket disconnected: ${socket.id}`);
  });
});

export { io, server, getSocketIdByUserId };
