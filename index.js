const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const User = require('./models/user.model');
require('dotenv').config();

// Create app
const app = express();

// Config Middlewarses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

const secret = process.env.SECRET || 'secret';

app.use(
	session({
		secret: secret,
		resave: false,
		saveUninitialized: true,
	}),
);
app.use(cookieParser(secret));
app.use(passport.initialize());
app.use(passport.session());
require('./passportConfig.js')(passport);

// Routes
app.post('/login', (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) throw err;
		if (!user) res.send('No User Exists');
		else {
			req.login(user, (err) => {
				if (err) throw err;
				res.send('Successfully Authenticated');
			});
		}
	})(req, res, next);
});

app.post('/register', async (req, res) => {
	try {
		const user = await User.findByEmail(req.body.email);
		if (user) {
			res.send('User Already Exists');
		} else {
			const hashedPassword = await bcrypt.hash(req.body.password, 10);
			await User.create({
				username: req.body.username,
				email: req.body.email,
				password: hashedPassword,
			});
			res.send('user created');
		}
	} catch (error) {
		throw error;
	}
});

app.get('/user', (req, res) => {
	res.send(req.user);
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
