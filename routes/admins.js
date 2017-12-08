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

    const textChecked = `<p style="font-size:13px;"> Hoi ${resUserName}, <br/><br/>Welkom bij Legal Joe!<br/><br/>Vanaf nu kan je contracten uploaden via je persoonlijke account op <href="https://legaljoe.nl/">legaljoe.nl</a>.<br/>Hier krijg je ook je geanalyseerde contracten te zien.<br/>Contract analyse was nog nooit zo eenvoudig!<br/><br/>-- <br/>Legal Hustler,<br/><br/><img style="height:60px;weight:90px;" src="http://res.cloudinary.com/mdfchucknorris/image/upload/v1512727090/rrkjfc_tboyw3.png"/><br/><br/> "Legal made easy and simple" <br/><br/></p>
    <p style="font-size:10px;font-style:italic;">Website: <a href="https://legaljoe.nl/">legaljoe.nl</a><br/>Tel: +31629730740</p><br/><br/>`

  const mailOptions = {
      from: emailFrom,
      to: resUserEmail,
      subject: 'Contract gecheckt',
      html: textChecked
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
