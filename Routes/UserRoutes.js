const express = require('express');
const {upload, gallery} = require('../Helpers/Storage');
const router = express.Router();
const UserControllers = require('../Controller/UserControllers');

router.post('/register', upload.none(), UserControllers.register);
router.post('/login', UserControllers.login);
router.patch('/update-user/:id', UserControllers.updateUser);
router.delete('/delete-user/:id', UserControllers.deleteUser);
router.get('/display-users/:id', UserControllers.displayUsers);
router.get('/display-user/:id', UserControllers.displayUserById);
router.patch('/upload-img/:id', upload.single('avatar'), UserControllers.uploadImgs);
router.patch('/upload-gallery-imgs/:id', gallery.array('gallery[]', 10), UserControllers.uploadToUserGallery);
router.patch('/delete-gallery-img/:id', UserControllers.deleteUserGalleryImg);
router.patch('/send-friend-request/:id', UserControllers.sendFriendRequest);
router.get('/display-send-friend-request/:id', UserControllers.displaySendFriendRequests);
router.patch('/remove-send-friend-request/:id', UserControllers.removeSendFriendRequest);
router.get('/display-friend-requests/:id', UserControllers.displayFriendRequests);
router.patch('/remove-friend-request/:id', UserControllers.removeFriendRequest);
router.patch('/add-friend/:id', UserControllers.addFriend);
router.get('/display-friends/:id', UserControllers.displayFriends);
router.patch('/remove-friend/:id', UserControllers.removeFriend);
router.post('/forgot-password', UserControllers.forgotPassword);
router.patch('/update-password', UserControllers.updatePassword);
router.delete('/logout/:id', UserControllers.logout);

module.exports = router;