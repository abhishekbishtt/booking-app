
const bcrypt=require("bcrypt");
const crypto  =require("crypto");
const jwt=require("jsonwebtoken");
const { User, BlackListedTokens} = require("../models");
const { where,Op} = require("sequelize");
const saltRounds=10;
const sendResetEmail=require("../services/resetLink.services");






//registration of new user 
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    // password validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
if (!passwordRegex.test(password)) {
  return res.status(400).json({ 
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
  });
}

 
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'regular_user',
    });

    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error registering user'
    });
  }
};


//login part
exports.login= async (req,res)=>{
  const {email,password}=req.body
  if(!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ where: { email } });
  
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
  
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  
    return res.status(200).json({
       token,
       user:{
        id:user.id,
        name:user.name,
        email:user.email, 
        role:user.role,
       },
       message: 'User logged in successfully'
      
      });
  
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  };
}
  

//logout
exports.logout= async(req,res)=>{
  try{
    // Check if the token is provided 
    if(!req.header('Authorization')){
      return res.status(400).json({ message: 'No token provided' });
    }

  const authtoken=req.header('Authorization')?.split(' ')[1];
  if(!authtoken){
    return res.status(400).json({ message: 'No token provided' });
  }
await BlackListedTokens.create({
   token: authtoken,
   user_id:req.user.id,
   expires_at:new Date(req.user.exp *1000) //as user logins and pases fro verify middleware it gives him a exp key in its body that is the expiry of the bearer token 

 }
 
);

  return res.status(200).json({ message: 'User logged out successfully' });
}catch(error){
  console.error('Logout error:', error);
  return res.status(500).json({ message: 'Internal server error' });
}
}





//forget password
exports.forgotPassword= async (req,res)=>{
  
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try{
  const user=await User.findOne({ where: {email:email } });
  if(!user){
    return res.status(404).json({ message: 'User not found' });
  }
// generate a reset token
const resetToken =crypto.randomBytes(32).toString('hex'); // we could also make it 64 bytes  1 byte = 8 bits    64 byte =512 bits but its over kill here amd it is industry standard to use 256 bits  in reset pass
const resetTokenExpiry= new Date(Date.now()+15*60*1000);      //date.now returns time stamp in milliseconds its reference is taken from 1st January 1970(unix time)   new date() will convert it to date object ...  newdate(newdate()) will give same date object


await user.update({
  reset_token:resetToken,
  reset_token_expires:resetTokenExpiry,
});
//create reset link
const resetLink=`${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

//TODO:Send Email
await sendResetEmail(user.email,resetLink);
 return res.status(200).json({
  success:true,
  message:'Password reset link sent to your email'
 })


} catch(error) {  
  console.log("ERROR :",error);
  return res.status(500).json({
    success:false,
    message:"Internal server error"
  });

} 
}; 




//reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPass } = req.body;

    // Check if token is provided
    if (!token) {
      return res.status(400).json({ success: false, message: "Reset token is required" });
    }

    // Check if new password is provided
    if (!newPass) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    // Find the user whose reset token matches and is not expired
    const user = await User.findOne({
      where: {
        reset_token: token, // Token must match the one saved in DB
        reset_token_expiry: { [Op.gt]: new Date() } // Token must not be expired (expiry > now)
      }
    });

    // If no matching user is found, token is invalid or expired
    if (!user) {
      return res.status(400).json({ success: false, message: "Reset token is invalid or expired" });
    }

    // Validate password using regex (min 8 chars, at least one uppercase, one lowercase, and one number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPass)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters with uppercase, lowercase, and number"
      });
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPass, saltRounds);

    // Update the user's password and clear the reset token fields
    await user.update({
      password: hashedPassword,           // Save new hashed password
      reset_token: null,                  // Clear the reset token (invalidate it)
      reset_token_expiry: null            // Clear the expiry timestamp
    });

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    // Log and handle unexpected server errors
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};