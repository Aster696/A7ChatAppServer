const express = require('express');
const router = express.Router();
const AdminControllers = require('../Controller/AdminControllers');

router.delete('/delete-user/:id', AdminControllers.deleteUser);

module.exports = router;