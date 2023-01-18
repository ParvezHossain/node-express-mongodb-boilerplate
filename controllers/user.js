const { User, validateUser } = require("../models/User");
const asyncWrapper = require("../middleware/async");
const { createCustomerError } = require("../errors/custom-error");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SALT = process.env.SALT;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const validate = (userInfo) => {
  const schema = Joi.object({
    username: Joi.string().min(5).max(50).required(),
    password: Joi.string().min(6).max(255).required(),
  });
  return schema.validate(userInfo);
};

const createUser = asyncWrapper(async (req, res) => {
  // FIXME: Currently this is hard coded from the frontend perspective, need to give a look
  req.body.role = "admin";

  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  req.body.password = await bcrypt.hash(req.body.password, +SALT);
  let user = await User.create(req.body);
  user.password = null;
  res.status(201).json({ user });
});

const login = asyncWrapper(async (req, res, next) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return next(
      createCustomerError(
        `There is not user with username => ${req.body.username}`,
        404,
      ),
    );
  }
  const isEqual = await bcrypt.compare(req.body.password, user.password);
  if (!isEqual) {
    return next(createCustomerError(`Password does not match`, 401));
  }
  const payload = {
    userId: user.userId,
    email: user.email,
    role: user.role,
  };
  const token = jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  res.status(200).json({ userId: user.id, username: user.username, name: user.name, token, tokenExpiration: 1, statusCode: 200, message: "Login Successful" });
});

module.exports = {
  createUser,
  login,
};
