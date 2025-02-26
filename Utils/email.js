const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Busari Shakrudeen <${process.env.Email_From}>`;
  }

  emailTransporter() {
    // if (process.env.NODE_ENV === 'production') {
    //   return 1;
    // }

    return nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      // secure: true,
      auth: {
        user: '5d30c104d6265a',
        pass: 'fc6f2499766061',
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../Views/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
    });

    const mailObj = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.emailTransporter().sendMail(mailObj);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours family');
  }

  async sendResetPassword() {
    await this.send('resetPassword', 'Reset your password here😊😊');
  }
}

module.exports = Email;
