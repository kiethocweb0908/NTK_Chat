import mongoose, { Schema } from 'mongoose';
import { comparaValue, hashValue } from '../utils/bcrypt';

export interface IUser {
  userName: string;
  email: string;
  // phone?: string;
  hashPassword: string;
  avatarUrl?: string | null;
  avatarId?: string | null;
  displayName: string;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparaValue(val: string): Promise<boolean>;
}

const userSchema = new Schema<IUser, {}, IUserMethods>(
  {
    userName: {
      type: String,
      trim: true,
      required: true,
      min: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      min: 6,
    },
    // phone: {
    //   type: String,
    // },
    hashPassword: {
      type: String,
      required: true,
      min: 6,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    avatarId: {
      type: String,
      default: null,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      min: 6,
    },
    bio: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        if (ret) {
          delete (ret as any).hashPassword;
        }
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('hashPassword')) {
    return next();
  }

  try {
    this.hashPassword = await hashValue(this.hashPassword);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparaValue = async function (val: string) {
  return comparaValue(val, this.hashPassword);
};

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;
const User = mongoose.model<IUser, UserModel>('User', userSchema);
export default User;
