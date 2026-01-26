import mongoose, { Schema } from 'mongoose';

interface IFriend {
  userA: mongoose.Types.ObjectId;
  userB: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const friendSchema = new Schema<IFriend>(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

friendSchema.pre('save', function (next) {
  const a = this.userA.toString();
  const b = this.userB.toString();

  if (a > b) {
    this.userA = new mongoose.Types.ObjectId(b);
    this.userB = new mongoose.Types.ObjectId(a);
  }
  next();
});

// Unique Index (chống trùng lặp)
friendSchema.index({ userA: 1, userB: 1 }, { unique: true });
// Index cho việc truy vấn từ phía userB (Tránh quét toàn bộ bảng khi userB là người nhận)
friendSchema.index({ userB: 1 });
// thường xuyên lấy danh sách bạn bè mới nhất của 1 user
friendSchema.index({ userA: 1, _id: -1 });
friendSchema.index({ userB: 1, _id: -1 });

const Friend = mongoose.model('Friend', friendSchema);
export default Friend;
