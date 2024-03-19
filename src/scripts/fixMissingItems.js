// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { User } = require('../schemas/UserSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(async () => {
		console.log('Connected to MongoDB');
		const users = await User.find({ type: 'user' });
		// check if user has various fields.
		try {
			for (const user of users) {
				if (!user._doc.inventory.equippedRod) user.inventory.equippedRod = null;
				if (!user._doc.inventory.equippedBait) user.inventory.equippedBait = null;
				if (!user._doc.inventory.items) user.inventory.items = [];
				if (!user._doc.inventory.baits) user.inventory.baits = [];
				if (!user._doc.inventory.rods) user.inventory.rods = [];
				if (!user._doc.inventory.fish) user.inventory.fish = [];
				await user.save();
				console.log(`Updated user ${user.userId}`);
			}
		}
		catch (error) {
			console.error(error);
		}
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});
