const router = require('express').Router()
const { User, UserDoc, Email } = require('../server/models')
const passport = require('../config/auth')
const authenticate = passport.authorize('jwt', { session: false })
const { transporter, emailFrom } = require('../config/email')

router.post('/users', (req, res, next) => {
  var adminSet = (req.body.username === "admin@email.com") ? true : false
  var subjectOne = ""
  var textChecked = ""

  Email.findAll()
    .then((emails) => {
      const email = emails.filter(e=>e.textPaid === null)
      subjectOne = email[0].subjectOne,
      text = email[0].textChecked

  const mailOptions = {
      from: emailFrom,
      to: req.body.username,
      subject: subjectOne,
      text: `${req.body.firstName} ${req.body.lastName},\n ${text}`,
  }

  transporter.sendMail(mailOptions, function(err, info){
      if(err){
          return console.log(err);
      }
      console.log('Message sent: ' + info.response);
  })

  User.create({
     firstName: req.body.firstName,
     lastName: req.body.lastName,
     username: req.body.username,
     password: req.body.password,
     admin: adminSet
    })
      .then(user=> res.status(201).send({email: user.username, firstName: user.firstName,
         lastName: user.lastName
         }))
      .catch(error => res.status(400).send(error));
 })
})


router.get('/users/me', authenticate, (req, res, next) => {
  if (!req.account) {
    const error = new Error('Unauthorized')
    error.status = 401
    next(error)
  }

  if (req.account.admin === true ) {res.json({ firstName: req.account.firstName,
    lastName: req.account.lastName,email: req.account.username, id: req.account.id,
    admin: req.account.admin})}
  res.json({firstName: req.account.firstName, lastName: req.account.lastName,
     email: req.account.username, id: req.account.id})
})



module.exports = router
