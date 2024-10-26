import jwt from "jsonwebtoken";
import createError from "http-errors";
import User from "../models/user.js";
import Session from "../models/session.js";

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    return next(createError(401, "Not authorized"));
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const session = await Session.findOne({ userId: id, accessToken: token });
    if (!session) {
      return next(createError(401, "Session expired or token invalid"));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(createError(401, "Not authorized"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(createError(401, "Not authorized"));
    console.error(error);
  }
};

export default authenticate;