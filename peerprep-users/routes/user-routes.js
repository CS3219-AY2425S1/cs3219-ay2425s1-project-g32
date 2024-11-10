import express from "express";

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  updateUserPrivilege,
  changePassword,
} from "../controller/user-controller.js";
import {
  verifyAccessToken,
  verifyIsAdmin,
  verifyIsOwnerOrAdmin,
} from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getAllUsers);

router.patch(
  "/:id/privilege",
  verifyAccessToken,
  verifyIsAdmin,
  updateUserPrivilege
);

router.post("/", createUser);

router.get("/:id", verifyAccessToken, getUser);

router.patch("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, updateUser);

router.delete("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, deleteUser);

router.patch(
  "/:id/password",
  verifyAccessToken,
  verifyIsOwnerOrAdmin,
  changePassword
);

export default router;
