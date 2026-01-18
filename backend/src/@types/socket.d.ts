import { IUser } from '../models/User.model';
import mongoose from 'mongoose';
import 'socket.io';

declare module 'socket.io' {
  interface Socket {
    user?: mongoose.HydratedDocument<IUser>;
  }
}
