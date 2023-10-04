const express = require("express");
const testUser = require("../middleware/testUser");

const router = express.Router();

const {
  getAllComplaints,
  getComplaint,
  enrollComplaint,
  updateComplaint,
  deleteComplaint,
  showStats,
} = require("../controllers/complaints");

router
  .route("/")
  .post(cors(), testUser, enrollComplaint)
  .get(cors(), getAllComplaints);
router.route("/stats").get(cors(), showStats);

router
  .route("/:id")
  .get(cors(), getComplaint)
  .delete(cors(), testUser, deleteComplaint)
  .patch(cors(), testUser, updateComplaint);
module.exports = router;
