const router = require('express').Router()
const { UserDoc, Email } = require('../server/models')
const { transporter, emailFrom } = require('../config/email')
const passport = require('../config/auth')
const authenticate = passport.authorize('jwt', { session: false });

//send an email with the input text
router.post('/userdocs', (req, res, next) => {
  const resUserName = req.body.data.tags[0]
  const resUserEmail = req.body.data.tags[1]
  const resUserPaid = (req.body.data.tags[2] === "true") ? true : false
  const userId = req.body.data.tags[3]

  var subjectOne = ""
  var textPaid = ""
  var textFree = ""

  Email.findAll()
    .then((emails) => {
      const email = emails.filter(e=>e.textPaid !== null)
      subjectOne = email[0].subjectOne,
      textPaid = email[0].textPaid,
      textFree = email[0].textFree

      const resCloudinaryURL = req.body.data.secure_url
      const resCloudinaryFileName = req.body.data.public_id

      var userText = (resUserPaid === true)
      ? (textPaid)
      : (textFree)

      // setup e-mail data with unicode symbols
      const mailOptions = {
          from: emailFrom, // sender address
          to: resUserEmail, // list of receivers
          subject: subjectOne, // Subject line
          text: userText, // plaintext body
      };

      var joeText = (resUserPaid === true)
      ? (`Contract is verstuurd met volgende tekst: "${userText}" Het contract is hier: ${resCloudinaryURL}. De klant heeft voor de betaalde optie gekozen`)
      : (`Contract is verstuurd met volgende tekst: "${userText}" Het contract is hier: ${resCloudinaryURL}. De klant heeft de gratis optie gekozen`)

      const mailJoe = {
          from: emailFrom, // sender address
          to: emailFrom, // list of receivers
          subject: `${resUserEmail}`, // Subject line
          text: joeText, // plaintext body
      };

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
        paidContract: resUserPaid,
        userId: userId
      })
        .then(user=> res.status(201).send({"received":"true"}))
        .catch(error => res.status(400).send(error));
    })
})
router.post('/docs', authenticate, (req, res, next) => {
  const id = req.body.id
  if (!req.account) {
    const error = new Error('Unauthorized')
    error.status = 401
    next(error)
  }

   UserDoc.findAll({
      order: [['createdAt', 'DESC']]
      })
       .then((docs) => {
     const userContracts = docs.filter(d=>d.userId == id)
     const contracts = userContracts.map((u) => ({cloudinaryFileName: u.cloudinaryFileName,
       cloudinaryURL: u.cloudinaryURL, createdAt: u.createdAt, checked: u.checkedContract}))
     res.json(contracts)})
   .catch((error) => next(error))

})

module.exports = router
