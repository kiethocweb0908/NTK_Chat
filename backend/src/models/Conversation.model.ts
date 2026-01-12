import mongoose, { Schema } from 'mongoose';

interface IParticipant {
  userId: mongoose.Types.ObjectId;
  joinedAt: Date;
}

interface ILastMessage {
  _id: string;
  content?: string | null;
  senderId: mongoose.Types.ObjectId;
  createdAt?: Date | null;
}

interface IGroup {
  name: string;
  createdBy: mongoose.Types.ObjectId;
}

export interface IConversation {
  type: 'direct' | 'group';
  group?: IGroup;

  participants: IParticipant[];
  lastMessage?: ILastMessage | null;
  lastMessageAt?: Date;

  seenBy: mongoose.Types.ObjectId[];
  unreadCounts: Map<string, number>;

  createdAt: Date;
  updatedAt: Date;
}

//========================================================

const participantSchema = new Schema<IParticipant>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    _id: false,
  }
);

const lastMessageSchema = new Schema<ILastMessage>(
  {
    _id: {
      type: String,
    },
    content: {
      type: String,
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
    },
    group: {
      type: groupSchema,
    },
    participants: {
      type: [participantSchema],
      required: true,
    },
    lastMessage: {
      type: lastMessageSchema,
    },
    lastMessageAt: {
      type: Date,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({
  'participants.userId': 1,
  lastMessageAt: -1,
});

const Conversation = mongoose.model<IConversation>(
  'Conversation',
  conversationSchema
);
export default Conversation;
