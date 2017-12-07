const router = require('express').Router()
const { User, UserDoc, Email } = require('../server/models')
const passport = require('../config/auth')
const authenticate = passport.authorize('jwt', { session: false })
const { transporter, emailFrom } = require('../config/email')

router.get('/docs', authenticate, (req, res, next) => {
  if (!req.account && req.account.admin === false) {
    const error = new Error('Unauthorized')
    error.status = 401
    next(error)
  }
  else {

  UserDoc.findAll({
    order: [['createdAt', 'DESC']]
 })
   .then((docs) => {
     const userContracts = docs.map((c) =>
     ({email: c.userEmail, name: c.userName, cloudinaryFileName: c.cloudinaryFileName,
       cloudinaryURL: c.cloudinaryURL, paid: c.paidContract, checked: c.checkedContract,
       id: c.id, createdAt: c.createdAt }))
     res.json(userContracts)
   })
   .catch((error) => next(error))
  }
})

router.put('/admindocs', (req, res, next) => {
  const resUserName = req.body.data.tags[0]
  const resUserEmail = req.body.data.tags[1]
  const id = req.body.data.tags[2]

  const resCloudinaryURL = req.body.data.secure_url
  const resCloudinaryFileName = req.body.data.public_id

Email.findAll()
  .then((emails) => {
    const email = emails.filter(e=>e.textPaid !== null)
    subjectTwo = email[0].subjectTwo,
    textChecked = email[0].textChecked

  const mailOptions = {
      from: emailFrom,
      to: resUserEmail,
      subject: subjectTwo,
      text: textChecked + `\nHet contract is hier: ${resCloudinaryURL}`,
  }

  transporter.sendMail(mailOptions, function(err, info){
      if(err){
          return console.log(err);
      }
      console.log('Message sent: ' + info.response);
  })

  UserDoc.findById(id)
  .then((doc) => {
     if (!doc) { return next() }
     return doc
       .update({
         cloudinaryURL: resCloudinaryURL || doc.cloudinaryURL,
         checkedContract: true
       })
   .then(() => res.json(doc))
   .catch((error) => next(error))
  })
 })
})

router.get('/emails', authenticate, (req, res, next) => {
  if (!req.account && req.account.admin === false) {
    const error = new Error('Unauthorized')
    error.status = 401
    next(error)
  }
  else {

  Email.findAll()
   .then(email => res.json(email))
   .catch((error) => next(error))
  }
})

  .put('/emails', authenticate, (req, res, next) => {
  if (req.account.admin === false) {
   const error = new Error('Unauthorized')
   error.status = 401
   next(error)
  }
  else {
   return Email
    .findById(req.body.id)
    .then((email) => {
       if (!email) { return next() }
       return email
         .update({
           subjectOne: req.body.subjectOne || email.subjectOne,
           subjectTwo: req.body.subjectTwo || email.subjectTwo,
           textPaid: req.body.textPaid || email.textPaid,
           textFree: req.body.textFree || email.textFree,
           textChecked: req.body.textChecked || email.textChecked
         })
     .then(() => res.json(email))
     .catch((error) => next(error))
   })
  }
  })




module.exports = router
