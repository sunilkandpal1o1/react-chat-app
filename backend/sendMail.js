const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sskandpal.uk@gmail.com',
        pass: 'principleoflove'
    }
});

const mailOptions = {
    from: 'sskandpal.uk@gmail.com',
    to: 'sskandpal.uk.sk@gmail.com',
    text: 'hello there!',
};

transport.sendMail(mailOptions).then(res=> console.log(res)).catch(err=>console.log(err))