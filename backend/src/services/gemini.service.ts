import { GoogleGenAI } from '@google/genai';
import Message from '../models/Message.model';
import { updateConversationAfterCreateMessage } from '../utils/messageHelper';
import { io } from '../socket/index.socket';
import mongoose from 'mongoose';

// Khởi tạo SDK với API Key từ .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const handleBotResponse = async (
  conversation: any,
  userContent: string,
  botUser: any
) => {
  const tempBotMsgId = new mongoose.Types.ObjectId().toString();
  let fullBotResponse = '';

  try {
    // 1. Format history (Vẫn giữ logic xen kẽ)
    const rawMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const history = rawMessages.reverse().map((m) => ({
      role: m.senderId.toString() === botUser._id.toString() ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    // 2. Dùng generateContentStream
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: history,
    });

    // 3. Lặp qua từng chunk (mảnh chữ) trả về
    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullBotResponse += chunkText;

        // 4. Emit ngay lập tức cho Frontend
        io.to(conversation._id.toString()).emit('bot-chunk', {
          conversationId: conversation._id,
          messageId: tempBotMsgId,
          chunk: chunkText,
          senderId: botUser._id,
        });
      }
    }

    // 5. Lưu DB
    const botMessage = await Message.create({
      _id: tempBotMsgId,
      conversationId: conversation._id,
      senderId: botUser._id,
      content: fullBotResponse,
    });

    // Đưa conversation về trạng thái nguyên bản
    conversation.depopulate('participants.userId');
    conversation.depopulate('lastMessage.senderId');
    conversation.depopulate('seenBy');

    updateConversationAfterCreateMessage(
      conversation,
      botMessage,
      botUser._id.toString()
    );
    await conversation.save();

    console.log('--- BOT ĐÃ STREAM XONG VÀ LƯU DB ---');
  } catch (error: any) {
    console.error('LỖI SDK @google/genai:', error.message);
    io.to(conversation._id.toString()).emit('bot-error', {
      message: 'Tớ đang bận tí, quay lại sau nha!',
    });
  }
};
