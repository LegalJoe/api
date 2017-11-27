const router = require('express').Router()
const { UserDoc, Email } = require('../server/models')
const nodemailer = require('nodemailer');
const passport = require('../config/auth')
const authenticate = passport.authorize('jwt', { session: false });

const mailPassword = process.env.LEGALJOEPASSWORD

//send an email with the input text
router.post('/userdocs', (req, res, next) => {
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'legaljoemailer@gmail.com',
      pass: mailPassword //this should be set to an env-when we deploy
    }
  });

  const resUserName = req.body.data.tags[0]
  const resUserEmail = req.body.data.tags[1]
  const resUserPaid = (req.body.data.tags[2] === "true") ? true : false
  var subjectOne = ""
  var textPaid = ""
  var textFree = ""

  Email.findById(1)
    .then((email) => {
      subjectOne = email.subjectOne,
      textPaid = email.textPaid,
      textFree = email.textFree

      const resCloudinaryURL = req.body.data.secure_url
      const resCloudinaryFileName = req.body.data.public_id

      var userText = (resUserPaid === true)
      ? (textPaid)
      : (textFree)

      // setup e-mail data with unicode symbols
      const mailOptions = {
          from: 'legaljoemailer@gmail.com', // sender address
          to: resUserEmail, // list of receivers
          subject: subjectOne, // Subject line
          text: userText, // plaintext body
      };

      var joeText = (resUserPaid === true)
      ? (`Contract is verstuurd met volgende tekst: "${userText}" Het contract is hier: ${resCloudinaryURL}. De klant heeft voor de betaalde optie gekozen`)
      : (`Contract is verstuurd met volgende tekst: "${userText}" Het contract is hier: ${resCloudinaryURL}. De klant heeft de gratis optie gekozen`)

      const mailJoe = {
          from: 'legaljoemailer@gmail.com', // sender address
          to: 'legaljoemailer@gmail.com', // list of receivers
          subject: `${resUserEmail}`, // Subject line
          text: joeText, // plaintext body
      };
      console.log(mailOptions)

      transporter.sendMail(mailOptions, function(err, info){
          if(err){
              return console.log(err);
          }
          console.log('Message sent: ' + info.response);
      });

      transporter.sendMail(mailJoe, function(err, info){
          if(err){
              return console.log(err);
          }
          console.log('Message sent: ' + info.response);
      });

      UserDoc.create({
        userEmail: resUserEmail,
        userName: resUserName,
        cloudinaryFileName: resCloudinaryFileName,
        cloudinaryURL: resCloudinaryURL,
        paidContract: resUserPaid
      })
        .then(user=> res.status(201).send("I have your document"))
        .catch(error => res.status(400).send(error));
    })
})
router.post('/docs', authenticate, (req, res, next) => {
  const email = req.body.email
  if (!req.account) {
    const error = new Error('Unauthorized')
    error.status = 401
    next(error)
  }

   UserDoc.findAll({
      order: [['createdAt', 'DESC']]
      })
       .then((docs) => {
     const userContracts = docs.filter(d=>d.userEmail === email)
     const contracts = userContracts.map((u) => ({cloudinaryFileName: u.cloudinaryFileName,
       cloudinaryURL: u.cloudinaryURL, createdAt: u.createdAt, checked: u.checkedContract}))
     res.json(contracts)})
   .catch((error) => next(error))

})

module.exports = router
