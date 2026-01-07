const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require("../Middleware/auth");
const { createIssue, getIssues, getUserIssues } = require('../Controller/IssueController.js');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


router.post('/', auth, upload.single('image'), createIssue);
router.get('/', getIssues);
router.get('/my', auth, getUserIssues);


module.exports = router;
