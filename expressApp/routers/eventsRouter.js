const express = require('express');
const eventController = require('../controllers/eventController');

const expressValidator = require('express-validator');

const router = express.Router();

router.get('/', eventController.getAllEvents);
router.get('/event/:id', /*eventController.validate('getEventById'),*/ eventController.getEventById);
router.post('/', eventController.validate('insertEvent'), eventController.insertEvent);
router.put('/event/:id', eventController.validate('updateEvent'), eventController.updateEvent);
router.delete('/event/:id', /*eventController.validate('deleteEvent'),*/ eventController.deleteEvent);
router.get('/search/', /*eventController.validate('getEventsByNameAndDate'),*/ eventController.getEventsByNameAndDate);
router.get('/export/', /*eventController.validate('exportByEventId'),*/ eventController.exportByEventId);

module.exports = router;
