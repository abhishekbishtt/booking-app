const sendResetEmail = async (email, resetLink) => {
    // For development - just log the reset link
    console.log(`Reset link for ${email}: ${resetLink}`);
    console.log('In production, this would be sent via email');
  };
module.exports=sendResetEmail;  