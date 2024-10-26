import User from "../models/user.js";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import Session from "../models/session.js";

export const registerUser = async ({ name, email, password }) => {
  const newUser = new User({
    name,
    email,
    password,
  });

  await newUser.save();
  return newUser;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, "Invalid email or password");
  }

  return user;
};

export const deleteSession = async (refreshToken) => {
  const session = await Session.findOneAndDelete({ refreshToken });

  if (!session) {
    throw createHttpError(404, "Session not found");
  }

  return session;
};