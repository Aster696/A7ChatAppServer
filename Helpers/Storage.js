const multer = require('multer');
const fs = require('fs');

//avatar storage
try {
    var diskstorage = multer.diskStorage({
        destination: (req, file, cb) => {
            if(!fs.existsSync('Files/UserAvatars/'+req.params.id)) {
                fs.mkdirSync('Files/UserAvatars/'+req.params.id)
            }
            cb(null, 'Files/UserAvatars/'+req.params.id);
        },
        filename: (req, file, cb) => {
            console.log(file);
            var filetype = '';
            if(file.mimetype === 'image/gif') {
                filetype = 'gif';
            }
            if(file.mimetype === 'image/png') {
                filetype = 'png';
            }
            if(file.mimetype === 'image/jpeg') {
                filetype = 'jpg';
            }
            cb(null, 'image-' + Date.now() + '.' + filetype);
        }
    })
} catch (error) {
    console.log(error);
}

//avatar storage
try {
    var Gallery = multer.diskStorage({
        destination: (req, file, cb) => {
            if(!fs.existsSync('Files/UserGallerys/'+req.params.id)) {
                fs.mkdirSync('Files/UserGallerys/'+req.params.id)
            }
            cb(null, 'Files/UserGallerys/'+req.params.id);
        },
        filename: (req, file, cb) => {
            console.log(file);
            var filetype = '';
            if(file.mimetype === 'image/gif') {
                filetype = 'gif';
            }
            if(file.mimetype === 'image/png') {
                filetype = 'png';
            }
            if(file.mimetype === 'image/jpeg') {
                filetype = 'jpg';
            }
            cb(null, 'image-' + Date.now() + '.' + filetype);
        }
    })
} catch (error) {
    console.log(error);
}

const upload = multer({storage: diskstorage});
const gallery = multer({storage: Gallery});
module.exports = {upload, gallery};
