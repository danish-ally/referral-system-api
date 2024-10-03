const crypto = require('crypto');

function generateRandomPassword(length = 8) {
    // Define the characters to be used in the password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    // Generate a random password using crypto.randomBytes
    const randomBytes = crypto.randomBytes(length);
    const password = Array.from(randomBytes)
      .map(byte => chars[byte % chars.length])
      .join('');
  
    return password;
  } 


  module.exports = generateRandomPassword;