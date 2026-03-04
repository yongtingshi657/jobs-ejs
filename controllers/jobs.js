const Job = require("../models/Job");

const getJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user._id }).sort("createdAt");
  res.render("jobs", { jobs });
};

// in form
const createJob = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    const job = await Job.create(req.body);
  } catch (e) {
    req.flash("error", "Something went wrong");
    return res.render("job", { errors: req.flash("error") });
  }
  res.redirect("/jobs");
};

const getNewJobForm = (req, res) => {
  res.render("job", { job: null });
};

const getEditedJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findOne({ _id: jobId, createdBy: req.user._id });
    console.log(job);
    if (!job) {
      req.flash("error", "No Job Found");
      return res.redirect("/jobs");
    }

    res.render("job", { job });
  } catch {
    req.flash("error", "Something went wrong");
    return res.redirect("/jobs");
  }
};
const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findOneAndUpdate(
      { _id: jobId, createdBy: req.user._id },
      req.body,
      { returnDocument: 'after', runValidators: true },
    );
    console.log(req.body);
    if (!job) {
      req.flash("error", "No Job Found");
      return res.redirect("/jobs");
    }
     res.redirect("/jobs");
  } catch {
    req.flash("error", "Something went wrong");
    return res.redirect("/jobs");
  }
};
const deleteJob = async (req, res) => {
 try {
    const jobId = req.params.id;
    const job = await Job.findOneAndDelete({ _id: jobId, createdBy: req.user._id  });
    if (!job) {
      req.flash("error", "No Job Found");
      return res.render('jobs', {errors: req.flash('error')})
    } ;
    res.redirect("/jobs");
  } catch {
    req.flash("error", "Something went wrong");
    return res.render('jobs', {errors: req.flash('error')})
  }
 
};
module.exports = {
  getJobs,
  createJob,
  getNewJobForm,
  getEditedJob,
  updateJob,
  deleteJob,
};
