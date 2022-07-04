const express = require('express');
const {upload, gallery} = require('../Helpers/Storage');
const router = express.Router();
const MessageControllers = require('../Controller/MessageControllers');

router.post('/send-message', upload.none(), MessageControllers.sendMessage);
router.get('/display-messages/:id', MessageControllers.displayMessages);
router.patch('/update-message/:id', MessageControllers.updateMessage);
router.delete('/delete-message/:id', MessageControllers.deleteMessage);

module.exports = router;