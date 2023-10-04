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

router.route("/").post(testUser, enrollComplaint).get(getAllComplaints);
router.route("/stats").get(showStats);

router
  .route("/:id")
  .get(getComplaint)
  .delete(testUser, deleteComplaint)
  .patch(testUser, updateComplaint);
module.exports = router;
