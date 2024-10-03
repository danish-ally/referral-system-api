const crypto = require("crypto");

const generateUniqueReferralCode = (role) => {
    if (role === 'admin' || role === 'influencer' || role === 'student') {
        // Get the current timestamp as a string
        const timestamp = Date.now().toString();

        // Generate a random number with the remaining digits needed to reach a total of 10
        const remainingDigits = 8;
        const randomBytes = crypto.randomBytes(remainingDigits);
        const randomDigits = parseInt(randomBytes.toString("hex"), 16);

        // Combine timestamp and random number
        const rolePrefix = role.toUpperCase().slice(0, 2);
        const referralCode = rolePrefix + timestamp.slice(-6) + randomDigits;

        return referralCode.slice(0, 10); // Ensure the total length is 10 characters
    } else {
        return null;
    }
};

module.exports = generateUniqueReferralCode;
