// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Bait } = require('../schemas/BaitSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		// Generate and publish sample baits
		generateBaits();
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

// Function to generate sample baits
function generateBaits() {
	// Define an array of sample bait data
	const sampleBait = [
		{
			name: 'Worm',
			description: 'Classic bait for many freshwater fish species.',
			rarity: 'common',
			price: 10,
			shopItem: true,
			capabilities: ['weak', '2 count'],
			biomes: ['river', 'lake', 'pond'],
			weights: {
				common: 7000,
				uncommon: 2500,
				rare: 500,
				ultra: 100,
				giant: 50,
				legendary: 20,
				lucky: 1,
			},
		},
	];

	// Loop through the sample bait and create new bait documents
	sampleBait.forEach((baitData) => {
		const bait = new Bait(baitData);
		bait.save()
			.then(() => {
				console.log(`Bait "${bait.name}" created successfully`);
			})
			.catch((error) => {
				console.error(`Error creating bait "${bait.name}":`, error);
			});
	});
}
