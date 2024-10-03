const Joi = require("joi");

const phoneValidation = (phone) => {
  const schema = Joi.string()
    .pattern(/^\d{7,15}$/);
    return schema.validate(phone);
  };
  
  const emailValidation = (email) => {
    const schema = Joi.string().email();
    return schema.validate(email);
  };

  const logInBodyValidation = (body) => {
    const schema = Joi.object({
      email: Joi.string().email().label("email").required(),
      password: Joi.string().required().label("password"),
    });
  
    return schema.validate(body);
  };

  const changePasswordValidation = (body) => {
    const schema = Joi.object({
      oldPassword: Joi.string().required().label("oldPassword"),
      newPassword: Joi.string().required().label("newPassword"),
      confirmPassword: Joi.string().required().label("confirmPassword"),
    });
    return schema.validate(body);
  };

  const resetPasswordBodyValidation = (body) => {
    const schema = Joi.object({
      token: Joi.string().required().label("token"),
      newPassword: Joi.string().required().label("newPassword"),
      confirmPassword: Joi.string().required().label("confirmPassword"),
    });
    return schema.validate(body);
  };
  

  module.exports = {
    phoneValidation,
    emailValidation,
    logInBodyValidation,
    changePasswordValidation,
    resetPasswordBodyValidation
  };