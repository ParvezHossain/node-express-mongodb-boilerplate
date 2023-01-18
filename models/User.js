const Joi = require("joi");

const mongoose = require("mongoose");
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      unique: true,
    },
    role: {
      type: String, 
      required: true, 
      minlength: 4,
      maxlength: 20,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 1024,
    },
  }),
);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    username: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    role: Joi.string().min(4).max(20).required(),
    password: Joi.string().min(6).max(255).required(),
  });
  return schema.validate(user);
}

module.exports = {
  User,
  validateUser,
};
