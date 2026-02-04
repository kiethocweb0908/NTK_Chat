import mongoose, { Schema, Document, Model } from 'mongoose';

interface IPendingData {
  userName: string;
  displayName: string;
  hashPassword: string;
  avatarUrl?: string | null;
}

export interface IOtp extends Document {
  email: string;
  otp: string;
  type: 'REGISTER' | 'FORGOT_PASSWORD';
  pendingData?: IPendingData; // Chỉ có khi type là REGISTER
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['REGISTER', 'FORGOT_PASSWORD'],
      required: true,
    },

    pendingData: {
      userName: { type: String },
      displayName: { type: String },
      hashPassword: { type: String },
      avatarUrl: { type: String, default: null },
    },
    // Số lần nhập sai mã OTP
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp: Model<IOtp> = mongoose.model<IOtp>('Otp', otpSchema);
export default Otp;
