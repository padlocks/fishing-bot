// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { ItemData } = require('../schemas/ItemSchema');
const { RodData } = require('../schemas/RodSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(async () => {
		console.log('Connected to MongoDB');
		const rods = await ItemData.find({ type: 'quest' });
		// check if rod.requirements is an array and replace it with an object with a level property
		try {
			for (const rod of rods) {
				if (Array.isArray(rod._doc.requirements)) {
					const newRod = await RodData.findById(rod._doc._id);
					newRod.requirements = { level: 0 };
					await newRod.save();
					console.log(`Updated rod ${newRod.name}`);
				}
			}
		}
		catch (error) {
			console.error(error);
		}
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});
