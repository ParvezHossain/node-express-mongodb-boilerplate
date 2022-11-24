const express = require("express");
const router = express.Router();

const {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/task");

const authenticationMiddleware = require("../middleware/auth");

router.route("/").get(authenticationMiddleware, getAllTasks).post(authenticationMiddleware, createTask);
router.route("/:id").get(getTask).patch(updateTask).delete(deleteTask);

module.exports = router;
