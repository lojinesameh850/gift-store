exports.welcomeEmail = (firstName) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
    <h2>Welcome to Gift Store, ${firstName}! 🎁</h2>
    <p>Your account has been created successfully. You can now log in and start browsing our gifts.</p>
    <p>If you didn't create this account, please ignore this email.</p>
  </div>
`;

exports.otpEmail = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
    <h2>Password Reset Code</h2>
    <p>Use the code below to reset your password. It expires in 10 minutes.</p>
    <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  </div>
`;