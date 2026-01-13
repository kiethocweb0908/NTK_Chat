import mongoose, { Schema } from 'mongoose';

interface IFriendRequest {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  message?: string;

  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    maxlength: 300,
  },
});

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

friendRequestSchema.index({ from: 1 });
friendRequestSchema.index({ to: 1 });

const FriendRequest = mongoose.model('friendRequest', friendRequestSchema);
export default FriendRequest;
