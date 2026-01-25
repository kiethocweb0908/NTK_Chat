let isAudioUnlocked = false;

const sounds = {
  notify: new Audio('/sounds/message.mp3'),
  decline: new Audio('/sounds/reject.mp3'),
  success: new Audio('/sounds/success.mp3'),
  sendRequest: new Audio('/sounds/ding.mp3'),
};

// Thiết lập mặc định
Object.values(sounds).forEach((audio) => {
  audio.volume = 0.6;
  audio.preload = 'auto'; // Đảm bảo âm thanh được tải sẵn
});

export const unlockAudio = () => {
  if (isAudioUnlocked) return;

  // Thử phát tất cả âm thanh ở chế độ im lặng/ngắn để trình duyệt cấp quyền
  const promises = Object.values(sounds).map((audio) => {
    return audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
      })
      .catch((err) => console.warn('Audio unlock failed for a file:', err));
  });

  Promise.all(promises).then(() => {
    isAudioUnlocked = true;
    console.log('🔊 Audio System Unlocked');
  });
};

// Hàm phát âm thanh dùng chung cực gọn
const playSound = (key: 'notify' | 'decline' | 'success' | 'sendRequest') => {
  if (!isAudioUnlocked) return;
  const audio = sounds[key];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
};

export const playNotifySound = () => playSound('notify');
export const playDeclineSound = () => playSound('decline');
export const playSuccessSound = () => playSound('success');
export const playSendRequestSound = () => playSound('sendRequest');
