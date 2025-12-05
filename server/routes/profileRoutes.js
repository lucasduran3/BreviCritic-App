import express from "express";
import profilesController from "../controllers/profilesController.js";

const router = express.Router();

router.get("/", profilesController.getAll.bind(profilesController));

router.post("/new", (req, res) => {
  console.log("create a new user");
  res.send();
});

router.get("/:id", profilesController.getById.bind(profilesController));

router.put("/:id", profilesController.update.bind(profilesController));

router.delete("/:id", (req, res) => {
  console.log("delete a user by id");
  res.send();
});

export default router;
