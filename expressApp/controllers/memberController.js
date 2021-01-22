const MemberModel = require('../models/memberModel');
const log = require('../logger/logBus');
const { body, validationResult, matchedData, query } = require('express-validator');


exports.getAllMembers = async (req, res) => {
  log.emit('log', req);
  const members = await MemberModel.find({}).populate({
    path: 'eventsAttendance',
    select: ['event', 'timeIn', 'timeOut'],
    populate: { path: 'event', select: 'name' }
  }).exec();

  res.send(members);
};

exports.getMemberById = async (req, res) => {
  log.emit('log', req);
  const { id } = req.params;

  const memberDoc = await MemberModel.findById(id).populate({
    path: 'eventsAttendance',
    select: ['event', 'timeIn', 'timeOut'],
    populate: { path: 'event', select: 'name' }
  }).exec();

  if (!memberDoc) {
    res.status(400).json({ msg: `${id} does not exists.`, param: "id", "location": "header" });
    res.end();
    return;
  }

  res.send(memberDoc);
};

exports.getMembersByNameAndStatus = async (req, res) => {
  log.emit('log', req);
  const name = req.query.name;
  const status = req.query.status;

  const memberDoc = await MemberModel.find({ name: name, status: status }).populate({
    path: 'eventsAttendance',
    select: ['event', 'timeIn', 'timeOut'],
    populate: { path: 'event', select: 'name' }
  }).exec();

  if (!memberDoc || memberDoc.length <= 0) {
    res.status(400).json({
      msg: 'Data does not exist',
      location: 'query',
    });
    res.end();
    return;
  }

  res.send(memberDoc);
};

exports.insertMember = async (req, res) => {
  log.emit('log', req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  const memberTmp = await MemberModel.find({ name: req.body.name }).populate({
    path: 'eventsAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' }
  }).exec();
  if (memberTmp && memberTmp.length > 0) {
    res.status(409).json({
      msg: `${req.body.name} already exist`,
      param: 'name',
      location: 'body',
    });
    res.end();
    return;
  }

  const memberData = req.body;
  const memberModel = new MemberModel(memberData);
  const memberDoc = await memberModel.save();

  res.send(memberDoc);
};

exports.updateMember = async (req, res) => {
  log.emit('log', req);
  const { id } = req.params;
  const dataToUpdate = req.body;

  const memberTmp = await MemberModel.find({ _id: id }).populate({
    path: 'eventsAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' }
  }).exec();
  if (!memberTmp || memberTmp <= 0) {
    res.status(400).json({
      msg: `${id} does not exist`,
      param: 'id',
      location: 'query',
    });
    res.end();
    return;
  }

  const memberTmpName = await MemberModel.find({ name: req.body.name }).populate({
    path: 'eventsAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' }
  }).exec();
  if (memberTmpName && memberTmpName.lenght > 0) {
    res.status(409).json({
      msg: `${req.body.name} already exist`,
      param: 'name',
      location: 'body',
    });
    res.end();
    return;
  }

  await MemberModel.findByIdAndUpdate(id, dataToUpdate);

  res.sendStatus(200);
};

exports.deleteMember = async (req, res) => {
  log.emit('log', req);
  const { id } = req.params;

  const memberTmp = await MemberModel.find({ _id: id }).populate({
    path: 'eventsAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' }
  }).exec();
  if (!memberTmp || memberTmp <= 0) {
    res.status(409).json({
      msg: `${id} does not exist`,
      param: 'id',
      location: 'query',
    });
    res.end();
    return;
  }

  await MemberModel.findByIdAndDelete(id);

  res.sendStatus(200); // 200 = Ok
};

exports.validate = (method) => {
  switch (method) {
    case 'insertMember': {
      return [
        body('name', 'Name is required').exists(),
        body('status', 'Type is required').exists()
      ]
    }
    case 'updateMember': {
      return [
        body('name', 'Nme is required').exists(),
        body('status', 'Status is required').exists()
      ]
    }
    
  }
}