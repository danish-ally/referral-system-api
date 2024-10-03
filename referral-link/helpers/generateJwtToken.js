const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const generateJwtToken = (tokenPayload) => {

    const generatedToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRED });


    return generatedToken
};

module.exports = generateJwtToken