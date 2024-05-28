// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Gacha } = require('../schemas/GachaSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		// Generate and publish sample lootboxes
		generateGacha();
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

// Function to generate sample lootboxes
async function generateGacha() {
	// Define an array of sample gacha data
	const sampleGacha = [
		{
			name: 'Fishing Crate',
			description: 'A crate containing a random assortment of fishing supplies.',
			rarity: 'Common',
			capabilities: ['bait'],
			shopItem: true,
			price: 750,
			items: 10,
			icon: {
				animated: false,
				data: 'Treasure_Chest:1244066065751867423',
			},
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
		{
			name: 'Booster Pack',
			description: 'A pack containing boosters to help you in your journey.',
			rarity: 'Lucky',
			capabilities: ['buff'],
			icon: {
				animated: false,
				data: 'Treasure_Chest:1244066065751867423',
			},
			weights: {
				common: 0,
				uncommon: 0,
				rare: 500,
				ultra: 0,
				giant: 0,
				legendary: 0,
				lucky: 0,
			},
		},
		{
			name: 'Voter\'s Crate',
			description: 'A crate containing a random assortment of items for voters.',
			rarity: 'Rare',
			capabilities: ['bait', 'buff', 'rod', 'fish'],
			items: 3,
			icon: {
				animated: false,
				data: 'Treasure_Chest:1244066065751867423',
			},
			weights: {
				common: 3000,
				uncommon: 2500,
				rare: 500,
				ultra: 100,
				giant: 50,
				legendary: 20,
				lucky: 1,
			},
		},
		{
			name: 'Daily Box',
			description: 'A box containing a random assortment of items for daily quests.',
			rarity: 'Uncommon',
			capabilities: ['bait', 'buff', 'fish'],
			items: 3,
			icon: {
				animated: false,
				data: 'Treasure_Chest:1244066065751867423',
			},
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

	// Loop through the sample gacha and create new gacha documents
	sampleGacha.forEach((gachaData) => {
		const gacha = new Gacha(gachaData);
		gacha.save()
			.then(() => {
				console.log(`Box "${gacha.name}" created successfully`);
			})
			.catch((error) => {
				console.error(`Error creating box "${gacha.name}":`, error);
			});
	});
}
