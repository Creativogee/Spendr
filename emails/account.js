const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'creativogee@gmail.com',  
    subject: 'Welcome to Spendr',
    text: `Hi ${name}! Thank you for choosing Spendr for your day-to-day spending`
  })
}
const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'creativogee@gmail.com',  
    subject: 'Spendr will miss you',
    text: `Hi ${name}! It was our fault you had to leave. Could you please let us know where we got it wrong? Nevertheless, we hope to have you back sometime soon`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail
}