const User = require('../models/authModel');
const messageModel = require('../models/messageModel');
const multer = require('multer');
const fs = require('fs');
const path = require('path'); 

const getLastMessage = async (myId, fdId) => {
    const msg = await messageModel.findOne({
        $or: [{
            $and: [{
                senderId: {
                    $eq: myId
                }
            }, {
                reseverId: {
                    $eq: fdId
                }
            }]
        }, {
            $and: [{
                senderId: {
                    $eq: fdId
                }
            }, {
                reseverId: {
                    $eq: myId
                }
            }]
        }]

    }).sort({
        updatedAt: -1
    });
    return msg;
}

module.exports.getFriends = async (req, res) => {

    const myId = req.myId;
    let fnd_msg = [];


    try {

        const friendGet = await User.find({
            _id: {
                $ne: myId
            }
        });
        for (let i = 0; i < friendGet.length; i++) {
            let lmsg = await getLastMessage(myId, friendGet[i].id);
            fnd_msg = [...fnd_msg, {
                fndInfo: friendGet[i],
                msgInfo: lmsg
            }]


        }

        res.status(200).json({ success: true, friends: fnd_msg })

    } catch (error) {
        res.status(500).json({
            error: {
                errorMessage: 'Internal Sever Error'
            }
        })
    }
}

module.exports.messageUploadDB = async (req, res) => {
    const {
        senderName,
        reseverId,
        message
    } = req.body

    const senderId = req.myId;


    try {
        const insertMessage = await messageModel.create({
            senderId: senderId,
            senderName: senderName,
            reseverId: reseverId,
            message: {
                text: message,
                image: ''
            }
        })
        res.status(201).json({
            success: true,
            message: insertMessage
        })

    } catch (error) {
        res.status(500).json({
            error: {
                errorMessage: 'Internal Sever Error'
            }
        })
    }

}

module.exports.messageGet = async (req, res) => {
    const myId = req.myId;
    const fdId = req.params.id;

    try {
        let getAllMessage = await messageModel.find({

            $or: [{
                $and: [{
                    senderId: {
                        $eq: myId
                    }
                }, {
                    reseverId: {
                        $eq: fdId
                    }
                }]
            }, {
                $and: [{
                    senderId: {
                        $eq: fdId
                    }
                }, {
                    reseverId: {
                        $eq: myId
                    }
                }]
            }]
        })

        res.status(200).json({
            success: true,
            message: getAllMessage
        })

    } catch (error) {
        res.status(500).json({
            error: {
                errorMessage: 'Internal Server error'
            }
        })

    }

}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const randNumber = Math.floor(Math.random() * 99999);
        cb(null, randNumber + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('image');

module.exports.ImageMessageSend = (req, res) => {
    const senderId = req.myId;

    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({
                error: {
                    errorMessage: 'Image upload fail'
                }
            });
        } else if (err) {
            return res.status(500).json({
                error: {
                    errorMessage: 'Internal server error'
                }
            });
        }

        const { senderName, reseverId } = req.body;
        const imageName = req.file.filename;

        const newPath = path.join(__dirname, `../../frontend/public/image/${imageName}`);

        try {
            fs.copyFile(req.file.path, newPath, async (err) => {
                if (err) {
                    return res.status(500).json({
                        error: {
                            errorMessage: 'Image copy error'
                        }
                    });
                }

                try {
                    const insertMessage = await messageModel.create({
                        senderId: senderId,
                        senderName: senderName,
                        reseverId: reseverId,
                        message: {
                            text: '',
                            image: req.file.filename
                        }
                        
                    });

                    res.status(201).json({
                        success: true,
                        message: insertMessage
                    });
                } catch (dbError) {
                    console.error(dbError);
                    return res.status(500).json({
                        error: {
                            errorMessage: 'Database error'
                        }
                    });
                }
            });
        } catch (copyError) {
            console.error(copyError);
            return res.status(500).json({
                error: {
                    errorMessage: 'File copy error'
                }
            });
        }

        })
}

module.exports.messageSeen = async (req, res) => {
    const messageId = req.body._id;

    await messageModel.findByIdAndUpdate(messageId, {
        status : 'seen'
    })
    .then(() => {
        res.status(200).json({
            success : true
        })
    }).catch(() => {
        res.status(500).json({
            error : {
                errorMessage : 'Internal Server Error'
            }
        })
    })
}

module.exports.delivaredMessage = async (req, res) => {
    const messageId = req.body._id;

    await messageModel.findByIdAndUpdate(messageId, {
        status : 'delivared'
    })
    .then(() => {
        res.status(200).json({
            success : true
        })
    }).catch(() => {
        res.status(500).json({
            error : {
                errorMessage : 'Internal Server Error'
            }
        })
    })
}