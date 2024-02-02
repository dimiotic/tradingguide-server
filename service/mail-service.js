const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Account activation on ' + process.env.API_URL,
      text: '',
      html: `
    
 <div style="height: 100vh; 
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: sans-serif;
      color: #000;
">
  <div style="
      box-shadow: 0px 1px 12px 5px #ccc;
      border-radius: 12px;
      padding: 20px;
      width: 500px;
    ">
    <h1 style="letter-spacing: 16px; font-style: italic; margin-bottom: 80px;">TRADING<span style="color: #ffd82c;">GUIDE</span></h1>
    <h1>Hi, dear ${to}</h1>
    <p style="font-size: 18px;">
      In order to finish the registration process, click the button below to
      activate your account:
    </p>
    <a href='${link}' style="color: #fff; text-decoration: none;">
    <button
      style="padding: 20px 40px; background-color: #ffd82c; font-size: 24px; border-radius: 8px; border: none; cursor: pointer; margin-top: 30px;">Activate
      account</button>
    </a>
    <p style="margin: 55px 0 0;color: rgb(102, 102, 102);">Best Regards,</p>
    <p style="margin: 5px 0 50px;color: rgb(102, 102, 102);"> Trading-Guide Team</p>
    <div style="border-top: 1px solid #ccc;">
      <p>If you are having any troble with the "Activate account" button, copy and paste the link below into your web
        browser. </p>
      <a href="${link}">${link}</a>
    </div>
  </div>

      `,
    });
  }

  async sendInfoToOrder(to, item) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Your order on Trading Guide',
      text: '',
      html: `
    
 <div style="height: 100vh; 
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: sans-serif;
      color: #000;
">
  <div style="
      box-shadow: 0px 1px 12px 5px #ccc;
      border-radius: 12px;
      padding: 20px;
      width: 500px;
    ">
    <h1 style="letter-spacing: 16px; font-style: italic; margin-bottom: 80px;">TRADING<span style="color: #ffd82c;">GUIDE</span></h1>
    <h1>Hi, dear ${to}</h1>
    <p style="font-size: 18px;">
     Thank you for order: ${item}

    </p>

    <p style="margin: 55px 0 0;color: rgb(102, 102, 102);">Best Regards,</p>
    <p style="margin: 5px 0 50px;color: rgb(102, 102, 102);"> Trading-Guide Team</p>
   
  </div>

      `,
    });
  }
}

module.exports = new MailService();
