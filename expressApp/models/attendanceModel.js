const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  event: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Events',
    alias: 'eventId'
  },
  member: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Member',
    alias: 'memberId'
  },
  timeOut: {
    required: true,
    type: String
  },
  timeIn: {
    required: true,
    type: String
  }
});

const attendanceModel = mongoose.model('Attendance', attendanceSchema);

module.exports = attendanceModel;