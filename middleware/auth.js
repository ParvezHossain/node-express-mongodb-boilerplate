const jwt = require("jsonwebtoken");
// const { UnauthenticatedError } = require("../errors/index");
const asyncWrapper = require("./async");
const authenticationMiddleware = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new Error("No token provided");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET_KEY);
    const { id, email } = decoded;
    req.user = { id, email };
    next();
  } catch (error) {
    throw new Error("Not authorized to access this route!");
  }
});

module.exports = authenticationMiddleware;
