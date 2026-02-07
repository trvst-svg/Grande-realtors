import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {createUser, findUserByEmail, findUserByNumber, getRoleIdByName} from "../models/user.model.js";

function buildUserPayload(user) {
  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    number: user.number,
    role_id: user.role_id,
    citizenship_front: user.citizenship_front,
    citizenship_back: user.citizenship_back,
    approval_status: user.approval_status,
  };
}

export async function signup(req, res, next) {
  try {
    const { firstname, lastname, email, password, number } = req.body;
    const files = req.files || {};
    const citizenshipFront = files.citizenshipFront?.[0];
    const citizenshipBack = files.citizenshipBack?.[0];

    if ([firstname, lastname, email, password, number].some((v) => !v)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!citizenshipFront || !citizenshipBack) {
      return res.status(400).json({ error: "Citizenship images are required" });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const existingNumber = await findUserByNumber(number);
    if (existingNumber) {
      return res.status(409).json({ error: "Phone number already in use" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const roleId = await getRoleIdByName("user");

    const user = await createUser({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      number,
      role_id: roleId,
      citizenshipFront: `/uploads/users/${citizenshipFront.filename}`,
      citizenshipBack: `/uploads/users/${citizenshipBack.filename}`,
    });

    return res.status(201).json({
      message: "Signup request submitted for approval",
      user: buildUserPayload(user),
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if ([email, password].some((v) => !v)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.approval_status === "pending") {
      return res
        .status(403)
        .json({ error: "Your account is pending admin approval." });
    }

    if (user.approval_status === "rejected") {
      const reason =
        user.approval_reason || "Please contact support for details.";
      return res
        .status(403)
        .json({ error: `Your signup was rejected. ${reason}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = { id: user.id, email: user.email, role_id: user.role_id };
    const secret =
      process.env.JWT_SECRET || process.env.SECRET_KEY || "dev-secret";
    const token = jwt.sign(payload, secret, { expiresIn: "5h" });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: buildUserPayload(user),
    });
  } catch (err) {
    return next(err);
  }
}
