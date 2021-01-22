const express = require('express');
const attendanceController = require('../controllers/attendanceController');

const router = express.Router();

router.get('/', attendanceController.getAllAttendance);
router.post('/', attendanceController.validate('insertAttendance'), attendanceController.insertAttendance);
router.put('/attendance/:id', attendanceController.validate('updateAttendance'), attendanceController.updateAttendance);
router.delete('/attendance/:id', attendanceController.deleteAttendance);

module.exports = router;
