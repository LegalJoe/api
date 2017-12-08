const router = require('express').Router()
const { User, UserDoc, Email } = require('../server/models')
const passport = require('../config/auth')
const authenticate = passport.authorize('jwt', { session: false })
const { transporter, emailFrom } = require('../config/email')

router.post('/users', (req, res, next) => {
  var adminSet = (req.body.username === "admin@email.com") ? true : false
  var subjectOne = ""

  Email.findAll()
    .then((emails) => {
      const email = emails.filter(e=>e.textPaid === null)
      subjectOne = email[0].subjectOne

      const text = `<p style="font-size:13px;"> Hoi ${req.body.firstName} ${req.body.lastName}, <br/><br/>Je hebt gekozen voor de gratis contract analyse, je contract wordt toegevoegd aan mijn database.<br/><br/>Wie ben ik? Ik ben Joe een Artificial Intelligence advocaat. Ik heb inmiddels honderden contracten gezien en gelezen.<br/><br/>Ik ga voor jou op zoek naar afwijkende clausules in je ZZP contract zodat je weet waar je aan begint.<br/><br/>Je krijgt binnen 24 uur een reactie via email.<br/><br/>-- <br/>Legal Hustler,<br/><br/><img style="height:60px;weight:90px;" src="http://res.cloudinary.com/mdfchucknorris/image/upload/v1512727090/rrkjfc_tboyw3.png"/><br/><br/> "Legal made easy and simple" <br/><br/></p>
      <p style="font-size:10px;font-style:italic;">Website: <a href="https://legaljoe.nl/">legaljoe.nl</a><br/>Tel: +31629730740</p><br/><br/>`

  const mailOptions = {
      from: emailFrom,
      to: req.body.username,
      subject: subjectOne,
      html: text,
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
