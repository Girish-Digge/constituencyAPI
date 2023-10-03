const Complaint = require("../models/Complaint");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const mongoose = require("mongoose");
const moment = require("moment");

const getAllComplaints = async (req, res) => {
  const { search, status, complaintType, sort } = req.query;

  const queryObject = {
    createdBy: req.user.userId,
  };

  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }
  if (status && status !== "all") {
    queryObject.status = status;
  }
  if (complaintType && complaintType !== "all") {
    queryObject.complaintType = complaintType;
  }
  let result = Complaint.find(queryObject);

  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.sort("position");
  }
  if (sort === "z-a") {
    result = result.sort("-position");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const complaints = await result;

  const totalComplaints = await Complaint.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalComplaints / limit);

  res.status(StatusCodes.OK).json({ complaints, totalComplaints, numOfPages });
};
const getComplaint = async (req, res) => {
  const {
    user: { userId },
    params: { id: complaintId },
  } = req;

  const complaint = await Complaint.findOne({
    _id: complaintId,
    createdBy: userId,
  });
  if (!complaint) {
    throw new NotFoundError(`No complaint with id ${complaintId}`);
  }
  res.status(StatusCodes.OK).json({ complaint });
};

const enrollComplaint = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const complaint = await Complaint.create(req.body);
  res.status(StatusCodes.CREATED).json({ complaint });
};

const updateComplaint = async (req, res) => {
  const {
    body: {
      status,
      type,
      related,
      location,
      name,
      contact,
      address,
      ward,
      brief,
      other,
    },
    user: { userId },
    params: { id: complaintId },
  } = req;

  if (ward === "" || name === "") {
    throw new BadRequestError("fields cannot be empty");
  }
  const complaint = await Complaint.findByIdAndUpdate(
    { _id: complaintId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!complaint) {
    throw new NotFoundError(`No complaint with id ${complaintId}`);
  }
  res.status(StatusCodes.OK).json({ complaint });
};

const deleteComplaint = async (req, res) => {
  const {
    user: { userId },
    params: { id: complaintId },
  } = req;

  const complaint = await Complaint.findByIdAndRemove({
    _id: complaintId,
    createdBy: userId,
  });
  if (!complaint) {
    throw new NotFoundError(`No complaint with id ${complaintId}`);
  }
  res.status(StatusCodes.OK).send();
};

const showStats = async (req, res) => {
  let stats = await Complaint.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    completed: stats.completed || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Complaint.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

module.exports = {
  enrollComplaint,
  deleteComplaint,
  getAllComplaints,
  updateComplaint,
  getComplaint,
  showStats,
};
