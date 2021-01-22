const AttendanceModel = require('../models/attendanceModel');
const MemberModel = require('../models/memberModel');
const EventModel = require('../models/eventsModel');
const log = require('../logger/logBus');

const { body, validationResult, matchedData, query } = require('express-validator');

exports.getAllAttendance = async (req, res) => {
  log.emit('log', req);
  const attendance = await AttendanceModel.find().populate('event').populate('member').exec();
  res.send(attendance);
};

exports.insertAttendance = async (req, res, next) => {
  try {
    log.emit('log', req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }

    const memberTmp = await MemberModel.find({ _id: req.body.memberId }).exec();
    if (!memberTmp || memberTmp.length <= 0) {
      res.status(400).json({
        msg: `${req.body.memberId} does not exist`,
        param: "memberId",
        location: 'body',
      });
      res.end();
      return;
    }
    const eventTmp = await EventModel.find({ _id: req.body.eventId }).exec();
    if (!eventTmp || eventTmp.length <= 0) {
      res.status(400).json({
        msg: `${req.body.eventId} does not exist`,
        param: "eventId",
        location: 'body',
      });
      res.end();
      return;
    }

    const attendanceTmp = await AttendanceModel
      .find({ event: eventTmp, member: memberTmp })
      .exec();
    if (attendanceTmp && attendanceTmp.length > 0) {
      res.status(409).json({
        msg: `${req.body.eventId} and ${req.body.memberId} already exist`,
        param: ['Event', 'Member'],
        location: 'body',
      });
      res.end();
      return;
    }

    const attendanceData = req.body;
    const attendanceModel = new AttendanceModel(attendanceData);
    const attendanceDoc = await attendanceModel.save();

    const memberDoc = await MemberModel.findById(attendanceData.memberId);
    memberDoc.eventsAttendance.push(attendanceDoc._id);
    await memberDoc.save();
    const eventDoc = await EventModel.findById(attendanceData.eventId);
    eventDoc.membersAttendance.push(attendanceDoc._id);
    await eventDoc.save();

    res.sendStatus(200);
  } catch (e) {
    next({
      statusCode: 400,
      errorMessage: e.message
    });
  }
};

exports.updateAttendance = async (req, res) => {
  log.emit('log', req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  const { id } = req.params;
  const dataToUpdate = req.body;
  console.log(dataToUpdate);

  const memberTmp = await MemberModel.find({ _id: req.body.memberId }).exec();
  if (!memberTmp || memberTmp.length <= 0) {
    res.status(400).json({
      msg: `${req.body.memberId} does not exist`,
      param: "memberId",
      location: 'body',
    });
    res.end();
    return;
  }
  const eventTmp = await EventModel.find({ _id: req.body.eventId }).exec();
  if (!eventTmp || eventTmp.length <= 0) {
    res.status(400).json({
      msg: `${req.body.eventId} does not exist`,
      param: "eventId",
      location: 'body',
    });
    res.end();
    return;
  }

  const attendanceTmp = await AttendanceModel
    .find({ event: eventTmp, member: memberTmp })
    .exec();
  if (attendanceTmp && attendanceTmp.length > 0) {
    res.status(409).json({
      msg: `${req.body.eventId} and ${req.body.memberId} already exist`,
      param: ['Event', 'Member'],
      location: 'body',
    });
    res.end();
    return;
  }

  await AttendanceModel.findByIdAndUpdate(id, dataToUpdate).exec();

  res.sendStatus(200);
};

exports.deleteAttendance = async (req, res) => {
  log.emit('log', req);
  const { id } = req.params;

  const attendance = await AttendanceModel.find({ _id: id }).exec();
  if (!attendance || attendance.length <= 0) {
    res.status(400).json({
      msg: `${id} does not exist`,
      param: "id",
      location: 'query',
    });
    res.end();
    return;
  }

  await AttendanceModel.findByIdAndDelete(id);

  res.sendStatus(200); // 200 = Ok
};

exports.validate = (method) => {
  switch (method) {
    case 'insertAttendance': {
      return [
        body('eventId', 'Event is required').exists(),
        body('memberId', 'Member is required').exists()
      ]
    }
    case 'updateAttendance': {
      return [
        body('eventId', 'Event is required').exists(),
        body('memberId', 'Member is required').exists()
      ]
    }

  }
}