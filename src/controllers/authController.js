import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { deleteSession, registerUser } from "../services/auth.js";
import User from "../models/user.js";
import Session from "../models/session.js";
import jwt from "jsonwebtoken";

export const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, "Email in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await registerUser({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: 201,
      message: "Successfully registered a user!",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
  return { accessToken, refreshToken };
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, "Invalid email or password"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createHttpError(401, "Invalid email or password"));
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    await Session.findOneAndDelete({ userId: user._id });

    const session = new Session({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await session.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: 200,
      message: "Successfully logged in an user!",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshSessionController = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(createHttpError(401, "No refresh token provided"));
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      console.error("JWT verification error:", error);
      return next(createHttpError(401, "Invalid or expired refresh token"));
    }

    await Session.findOneAndDelete({ userId: decoded.id });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.id
    );

    const newSession = new Session({
      userId: decoded.id,
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await newSession.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: 200,
      message: "Successfully refreshed a session!",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(createHttpError(401, "No refresh token provided"));
    }

    await deleteSession(refreshToken);

    res.clearCookie("refreshToken");

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};