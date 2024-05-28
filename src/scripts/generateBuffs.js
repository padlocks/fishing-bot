// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Buff } = require('../schemas/BuffSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		// Generate and publish sample buffs
		generateBuffs();
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

// Function to generate sample buffs
function generateBuffs() {
	// Define an array of sample buff data
	const sampleBuffs = [
		{
			name: 'Double XP',
			description: 'Doubles the experience points earned from all activities.',
			active: false,
			capabilities: ['xp', '2.0'],
			length: 3600,
			icon: {
				animated: false,
				data: '',
			},
		},

		{
			name: 'Double Cash',
			description: 'Doubles your income earned from all activities.',
			active: false,
			capabilities: ['cash', '2.0'],
			length: 3600,
			icon: {
				animated: false,
				data: '',
			},
		},

		{
			name: 'Lucky Draw',
			description: 'Increases the chances of obtaining rare items from gacha draws.',
			active: false,
			capabilities: ['gacha', '1.5'],
			length: 3600,
			icon: {
				animated: false,
				data: '',
			},
		},
	];

	// Loop through the sample buffs and create new buff documents
	sampleBuffs.forEach((buffData) => {
		const buff = new Buff(buffData);
		buff.save()
			.then(() => {
				console.log(`Booster "${buff.name}" created successfully`);
			})
			.catch((error) => {
				console.error(`Error creating booster "${buff.name}":`, error);
			});
	});
}
