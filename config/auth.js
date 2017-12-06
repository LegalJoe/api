const passport = require('passport')
const { Strategy } = require('passport-jwt')
const { User } = require('../server/models')
const jwtOptions = require('./jwt')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const tokenStrategy = new Strategy(jwtOptions, (jwtPayload, done) => {
  User.findById(jwtPayload.id)
    .then((user) => {
      if (user) {
        done(null, user)
      } else {
        done(null, false)
      }
    })
    .catch((err) => done(err, false))
})

passport.use(new LocalStrategy(( username, password, done) => {
   User.findOne({where: { username: { [Op.eq]: username} }})
     .then((user) => {

       bcrypt.compare(password, user.password, function(err, res) {
       if(res) {
         done(null, { id: user.id, firstName: user.firstName, lastName: user.lastName,
            email: user.username })
        } else {
         done(null, false)
        }
      })
     })


}))

passport.serializeUser(function(user, done) {
    done(null, user.id)

})

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user)
    })
})

passport.use(tokenStrategy)

module.exports = passport
