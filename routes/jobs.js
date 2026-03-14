const express = require('express')
const { deleteJob, updateJob, getEditedJob, getJobs, createJob, getNewJobForm } = require('../controllers/jobs')
const router = express.Router()

router.route('/').get(getJobs).post(createJob)
router.get('/new', getNewJobForm)
router.get('/edit/:id', getEditedJob)
router.post('/update/:id', updateJob)
router.post('/delete/:id',deleteJob )

module.exports = router


