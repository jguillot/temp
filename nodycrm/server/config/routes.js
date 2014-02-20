var clientCtrl = require('../controllers/client');
var userCtrl = require('../controllers/user');
var actionCtrl = require('../controllers/action');
var auth = require('../config/auth');
var authenticated = auth.requiresLogin;
var adminAuth = [auth.requiresLogin, auth.admin]
var flash = require('connect-flash');

module.exports = function (app, passport) {
	// Login
	app.post('/login',
	  passport.authenticate('local', { successRedirect: '/crm',
	                                   failureRedirect: '/',
	                                   failureFlash: true,
	                                   badRequestMessage:'Email ou Mot de passe manquant' })
	);
	// Logout
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
		// req.session.destroy(function (err) {
		// 	console.log('hole');
		//     res.redirect('/'); 
		//   });
	});

	// Route
	app.get('/', function(req , res) {
		// if (req.isAuthenticated()) { // not working...weird...tofix
		// 	res.redirect('/crm');
		// }
		// else {
			res.render('login',{ 
				error: req.flash('error')
			});
		// }
	});
	app.get('/crm', authenticated, function(req , res) {
		var user = {
			admin: req.user.admin,
			firstname: req.user.firstname,
			lastname: req.user.lastname,
			initial: req.user.initial,
			id: req.user._id,
		}
		res.render('app' , {user:JSON.stringify(user)});
	});


	// API client
	app.get ('/api/clients',                            clientCtrl.listjson);
	app.get ('/api/clients/:id',                        clientCtrl.detail);
	app.post('/api/clients/:id',                        clientCtrl.edit);
	app.post('/api/clients',                            clientCtrl.create);
	app.del ('/api/clients/:id', adminAuth,             clientCtrl.delete);
        
        // API client - action
        app.get ('/api/actions',                             actionCtrl.listjson);
        app.get ('/api/actions/clients/:idclient',           actionCtrl.listjson);
        app.get ('/api/actions/user/:iduser',                actionCtrl.listjson);
        app.post('/api/actions/clients/:idclient',           actionCtrl.create);
        app.get ('/api/actions/:idaction/',                  actionCtrl.detail);
        app.post('/api/actions/:idaction/clients/:idclient', actionCtrl.edit);


	// API client - followers
	app.post('/api/clients/:id/follower/:userID', adminAuth ,clientCtrl.setFollower);
	app.del('/api/clients/:id/follower', adminAuth ,clientCtrl.unsetFollower);
	// app.del('/api/clients/:id/followed', clientCtrl.deleteFollowed);

	// API user
	app.get('/api/users', adminAuth, userCtrl.listjson);
	app.get('/api/users/me', authenticated, userCtrl.me);
	app.get('/api/users/:id' ,adminAuth, userCtrl.detail);
	app.post('/api/users/:id' ,adminAuth, userCtrl.edit);
	app.post('/api/users',adminAuth, userCtrl.create);
	app.del('/api/users/:id',adminAuth, userCtrl.delete);
        
}