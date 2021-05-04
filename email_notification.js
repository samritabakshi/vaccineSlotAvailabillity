let nodemailer = require('nodemailer');

let nodemailerTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});


exports.sendEmail = function (email, subjectLine, slotDetails, callback) {
    let options = {
        from: String('Vaccine Checker ' + process.env.EMAIL),
        to: [email,"shreyans.sharma1992@gmail.com"],
        subject: subjectLine,
        text: 'Vaccine available. Details: \n\n' + slotDetails
    };
    nodemailerTransporter.sendMail(options, (error, info) => {
        if (error) {
            return callback(error);
        }
        callback(error, info);
    });
};
