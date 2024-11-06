// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { User } = require('../schemas/UserSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(async () => {
		console.log('Connected to MongoDB');
		try {
			// Update each user with createdAt date as Date.now()
			await User.updateMany({}, { createdAt: Date.now() });
			console.log('Updated createdAt for all users');
		}
		catch (error) {
			console.error(error);
		}
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});
