/*
 * Passport / Authentification
 */
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function (passport, config) {
	passport.use(new LocalStrategy({
		    usernameField: 'email',
		    passwordField: 'password'
		},
		function(email, password, done) {
		  User.findOne({ email: email}).exec(function(err, user) {
		    if (err) {return done(err , false , { message: 'Error!!'})}
		    if (!user.active) {
		      return done(null, false, { message: 'Votre compte est inactif' });
		    }	
		    if (!user) {
		      return done(null, false, { message: 'Email inconnu' });
		    }
		    if (!user.validPassword(password)) {
		      return done(null, false, { message: 'Mot de passe incorrect' });
		    }
		    return done(null, user);
		  });
		}
	));

	passport.serializeUser(function(user, done) {
	  done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findOne({ _id: id}, function (err, user) {
	    done(err, user);
	  });
	});
}