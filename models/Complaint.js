const mongoose = require("mongoose");

const EnrollSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name"],
      minLength: 3,
      maxLength: 20,
    },
    contact: {
      type: Number,
      required: [true, "Please provide contact number"],
      minLength: 10,
      maxLength: 10,
    },
    address: {
      type: String,
      required: [true, "Please provide address"],
      minLength: 3,
      maxLength: 200,
    },
    ward: {
      type: String,
      required: [true, "Ward"],
      minLength: 1,
      maxLength: 20,
    },
    brief: {
      type: String,
      required: [true, "Complain Brief"],
      minLength: 1,
      maxLength: 200,
    },
    status: {
      type: String,
      enum: ["completed", "declined", "pending"],
      default: "pending",
    },
    type: {
      type: String,
      enum: [
        "General",
        "Road",
        "HealthCare",
        "Legal",
        "Water",
        "Electricity",
        "Other",
      ],
      default: "General",
    },
    related: {
      type: String,
      enum: ["SMC", "ZP", "MSEB", "PWD", "Nagar Sevak", "Police", "Other"],
      default: "Other",
    },
    other: {
      type: String,
      required: [true, "Related to"],
      maxLength: 200,
    },
    location: {
      type: String,
      default: "Solapur",
      required: true,
    },
    createdBy: {
      type: String,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", EnrollSchema);
