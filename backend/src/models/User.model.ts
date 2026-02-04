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

  // --- THÊM MỚI ---
  googleId?: string; // Lưu ID từ Google
  isBot: boolean; // Để phân biệt User thường và Chatbot
  // ----------------

  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

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
      unique: true,
      trim: true,
      lowercase: true,
      min: 6,
      required: function (this: IUser) {
        return !this.isBot && !this.googleId;
      },
    },
    // phone: {
    //   type: String,
    // },
    hashPassword: {
      type: String,
      min: 6,
      required: function (this: IUser) {
        return !this.isBot && !this.googleId;
      },
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
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    //------------
    googleId: { type: String, unique: true, sparse: true }, // sparse để cho phép null nhưng vẫn unique
    isBot: { type: Boolean, default: false, index: true },
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
  if (this.isBot || this.googleId) return next();

  if (!this.isModified('hashPassword')) return next();

  if (this.hashPassword.startsWith('$2b$')) {
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
  if (this.isBot || this.googleId) return false;
  return comparaValue(val, this.hashPassword);
};

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;
const User = mongoose.model<IUser, UserModel>('User', userSchema);
export default User;
