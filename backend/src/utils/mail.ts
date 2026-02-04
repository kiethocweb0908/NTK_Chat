import * as brevo from '@getbrevo/brevo';

// Khởi tạo API Instance
const apiInstance = new brevo.TransactionalEmailsApi();

// Cấu hình API Key từ Brevo
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY as string
);

type MailType = 'REGISTER' | 'FORGOT_PASSWORD';

export const sendOTPMail = async (
  email: string,
  otp: string,
  userName: string,
  type: MailType = 'REGISTER'
) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  const isForgot = type === 'FORGOT_PASSWORD';

  sendSmtpEmail.subject = isForgot
    ? 'Khôi phục mật khẩu tài khoản NTK Chat'
    : 'Mã xác thực đăng ký - NTK Chat';

  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isForgot ? '#EF4444' : '#4F46E5'};">
      ${isForgot ? 'Yêu cầu đặt lại mật khẩu' : `Chào ${userName},`}
      </h2>
      <p style="color: #4b5563;">${
        isForgot ? 'Bạn đang yêu cầu đặt lại mật khẩu' : 'Cảm ơn bạn đã đăng ký'
      }. Để tiếp tục, vui lòng sử dụng mã xác thực dưới đây:</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
        <h1 style="color: #4F46E5; letter-spacing: 5px; margin: 0; font-size: 32px;">${otp}</h1>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">Đây là email tự động, vui lòng không phản hồi. Nếu bạn không yêu cầu mã này, hãy bảo mật tài khoản của mình.</p>
    </div>
  `;
  sendSmtpEmail.textContent = `Chào ${userName}, mã xác thực NTK Chat của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.`;

  // Email sender
  sendSmtpEmail.sender = {
    name: 'NTK Chat',
    email: 'kiethocweb0908@gmail.com',
  };

  // Gửi đến bất kỳ ai
  sendSmtpEmail.to = [{ email: email, name: userName }];
  try {
    // Gọi API
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('đã gửi mail thành công');
    return data;
  } catch (error) {
    console.error('Lỗi Brevo API:', error);
    throw new Error('Không thể gửi email lúc này.');
  }
};
