// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Fish } = require('../schemas/FishSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(async () => {
		console.log('Connected to MongoDB');

		const fish = await Fish.find({});

		fish.forEach(async (fish) => {
			fish.season = 'all';
			await fish.save();
		});

	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});