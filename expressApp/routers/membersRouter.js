const express = require('express');
const memberController = require('../controllers/memberController');

const router = express.Router();

router.get('/', memberController.getAllMembers);
router.get('/member/:id', memberController.getMemberById);
router.post('/', memberController.validate('insertMember'), memberController.insertMember);
router.put('/member/:id', memberController.validate('updateMember'), memberController.updateMember);
router.delete('/member/:id', memberController.deleteMember);
router.get('/search/', memberController.getMembersByNameAndStatus);

module.exports = router;
