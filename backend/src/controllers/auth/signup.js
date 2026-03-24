import bcrypt from "bcrypt";
import {createUser,findUserByEmail,findUserByNumber,getRoleIdByName,getRoleNameById,} from "../../models/user.model.js";
import buildUserPayload from "./buildUserPayload.js";
import cleanupUploads from "./cleanupUploads.js";

export default async function signup(req, res, next) {
  try {
    const firstname = req.body.firstname?.trim();
    const lastname = req.body.lastname?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password;
    const number = req.body.number?.trim();
    const files = req.files || {};
    const citizenshipFront = files.citizenshipFront?.[0];
    const citizenshipBack = files.citizenshipBack?.[0];

    if ([firstname, lastname, email, password, number].some((v) => !v)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!citizenshipFront || !citizenshipBack) {
      return res.status(400).json({ error: "Citizenship images are required" });
    }

    const uploadPaths = [citizenshipFront, citizenshipBack]
      .filter(Boolean)
      .map((file) => file.path)
      .filter(Boolean);

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      await cleanupUploads(uploadPaths);
      return res.status(409).json({ error: "Email already in use" });
    }

    const existingNumber = await findUserByNumber(number);
    if (existingNumber) {
      await cleanupUploads(uploadPaths);
      return res.status(409).json({ error: "Phone number already in use" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);  
    const roleId = 1

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

    const roleName = await getRoleNameById(user.role_id);
    return res.status(201).json({
      message: "Signup request submitted for approval",
      user: buildUserPayload(user, roleName),
    });
  } 

  catch (err) {
    const files = req.files || {};
    const uploadPaths = [files.citizenshipFront?.[0], files.citizenshipBack?.[0]]
      .filter(Boolean)
      .map((file) => file.path)
      .filter(Boolean);
    if (uploadPaths.length) {
      await cleanupUploads(uploadPaths);
    }
    return next(err);
  }
}
