const EventModel = require('../models/eventsModel');
const { XLSXExportService } = require('../services/xlsxExportService');
const log = require('../logger/logBus');
const { body, validationResult, matchedData, query } = require('express-validator');


const exportXLSX = new XLSXExportService();

exports.getAllEvents = async (req, res) => {
  log.emit('log', req);
  const events = await EventModel.find({}).populate({
    path: 'membersAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' }
  }).exec();

  res.send(events);
};

exports.getEventById = async (req, res) => {
  log.emit('log', req);
  const { id } = req.params;

  const eventDoc = await EventModel.findById(id).populate({
    path: 'membersAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' }
  }).exec();

  if (!eventDoc) {
    res.status(400).json({ msg: `${id} does not exists.`, param: "id", "location": "header" });
    res.end();
    return;
  }

  res.send(eventDoc);
};

exports.getEventsByNameAndDate = async (req, res) => {
  log.emit('log', req);
  const eventName = req.query.eventName;
  const startDate = req.query.dateStart;
  const endDate = req.query.dateEnd;

  const errors = validationResult(res);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
 
  const eventDoc = await EventModel.find({ name: eventName, startDate: startDate, endDate: endDate })
    .populate({
      path: 'membersAttendance',
      select: ['member', 'timeIn', 'timeOut'],
      populate: { path: 'member', select: 'name' }
    }).exec();
  if (!eventDoc || eventDoc.length <= 0) {
    //
    res.status(400).json({
      msg: 'Data does not exist',
      location: 'query',
    });
    res.end();
    return;
  }


  res.send(eventDoc);
};

exports.exportByEventId = async (req, res) => {
  log.emit('log', req);
  const eventId = req.query.eventId;

  const eventDoc = await EventModel.find({ _id: eventId }).populate({
    path: 'membersAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' },
    options: { sort: { timeIn: 'Asc' } }
  }).exec();

  if (!eventDoc || eventDoc.length <= 0) {
    //
    res.status(400).json({
      msg: 'Data does not exist',
      location: 'query',
    });
    res.end();
    return;
  }

  exportXLSX.export(eventDoc, res);
};

exports.insertEvent = async (req, res) => {
  log.emit('log', req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  const eventName = req.body.name;
  const eventDocTmp = await EventModel.find({ name: eventName }).populate({
    path: 'membersAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' }
  }).exec();
  if (eventDocTmp && eventDocTmp.length > 0) {
    //
    res.status(409).json({
      msg: `${eventName} already exist`,
      param: 'name',
      location: 'body',
    });
    res.end();
    return;
  }

  if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
    res.status(409).json({
      msg: `${req.body.startDate} should not be greater than ${req.body.endDate}`,
      param: ['startDate', 'endDate'],
      location: 'body',
    });
    res.end();
    return;
  }

  const eventData = req.body;
  const eventModel = new EventModel(eventData);
  const eventDoc = await eventModel.save();

  res.send(eventDoc);
};

exports.updateEvent = async (req, res) => {
  log.emit('log', req);
  const { id } = req.params;
  const name = req.body.name;
  const dataToUpdate = req.body;

  const eventDocTmp = await EventModel.find({ _id: id }).populate({
    path: 'membersAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' }
  }).exec();
  if (!eventDocTmp || eventDocTmp <= 0) {
    res.status(400).json({
      msg: `${id} does not exist`,
      param: "id",
      location: 'query',
    });
    res.end();
    return;
  }

  const eventDataTmp = await EventModel.find({ name: name }).populate({
    path: 'membersAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' }
  }).exec();
  if (eventDataTmp && eventDataTmp.length > 0) {
    res.status(409).json({
      msg: `${name} already exist`,
      param: "name",
      location: 'body',
    });
    res.end();
    return;
  }

  if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
    res.status(409).json({
      msg: `${req.body.startDate} should not be greater than ${req.body.endDate}`,
      param: ['startDate', 'endDate'],
      location: 'body',
    });
    res.end();
    return;
  }
  await EventModel.findByIdAndUpdate(id, dataToUpdate);

  res.sendStatus(200);
};

exports.deleteEvent = async (req, res) => {
  log.emit('log', req);
  const { id } = req.params;

  const eventDocTmp = await EventModel.find({ _id: id }).populate({
    path: 'membersAttendance',
    select: ['member', 'timeIn', 'timeOut'],
    populate: { path: 'member', select: 'name' }
  }).exec();
  if (!eventDocTmp || eventDocTmp.length <= 0) {
    res.status(400).json({
      msg: `${id} does not exist`,
      param: "id",
      location: 'query',
    });
    res.end();
    return;
  }

  await EventModel.findByIdAndDelete(id);

  res.sendStatus(200); // 200 = Ok
};

exports.validate = (method) => {
  switch (method) {
    case 'insertEvent': {
      return [
        body('name', 'Name is required').exists(),
        body('type', 'Type is required').exists(),
        body('startDate', 'Start Date is required').exists(),
        body('endDate', 'End Date is required').exists()
      ]
    }
    case 'updateEvent': {
      return [
        body('name', 'Name is required').exists()
      ]
    }
  }
}


