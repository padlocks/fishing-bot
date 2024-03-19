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
			capabilities: ['weak', '1'],
			biomes: ['river', 'lake', 'pond', 'swamp'],
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
			name: 'Shrimp',
			description: 'Classic bait for many saltwater fish species.',
			rarity: 'common',
			price: 10,
			shopItem: true,
			capabilities: ['weak', '1'],
			biomes: ['ocean', 'coast'],
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
			name: 'Minnow',
			description: 'Small fish bait for predatory freshwater fish species.',
			rarity: 'common',
			price: 150,
			shopItem: true,
			capabilities: ['weak', 'strong', '1'],
			biomes: ['river', 'lake', 'pond', 'swamp'],
			weights: {
				common: 7000,
				uncommon: 2500,
				rare: 500,
				ultra: 100,
				giant: 125,
				legendary: 20,
				lucky: 1,
			},
		},
		{
			name: 'Shrimp',
			description: 'Saltwater crustacean bait for predatory fish species.',
			rarity: 'common',
			price: 200,
			shopItem: true,
			capabilities: ['weak', 'strong', '1'],
			biomes: ['ocean', 'coast'],
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
			name: 'Spinner',
			description: 'Metallic lure for any predatory fish species.',
			rarity: 'uncommon',
			price: 500,
			shopItem: true,
			capabilities: ['weak', 'strong', '2 count'],
			biomes: ['river', 'lake', 'pond', 'ocean', 'coast', 'swamp'],
			multiplier: 1.25,
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
			name: 'Fly',
			description: 'Artificial insect bait for freshwater fish species.',
			rarity: 'rare',
			price: 1000,
			shopItem: true,
			capabilities: ['weak', 'strong', '3'],
			biomes: ['river', 'lake', 'pond', 'swamp'],
			multiplier: 1.25,
			weights: {
				common: 7000,
				uncommon: 2500,
				rare: 1000,
				ultra: 150,
				giant: 50,
				legendary: 20,
				lucky: 1,
			},
		},
		{
			name: 'Bloodworm',
			description: 'Red worm bait for predatory saltwater fish species.',
			rarity: 'rare',
			price: 1000,
			shopItem: true,
			capabilities: ['weak', 'strong', '3'],
			biomes: ['ocean', 'coast'],
			multiplier: 1.25,
			weights: {
				common: 7000,
				uncommon: 2500,
				rare: 1000,
				ultra: 150,
				giant: 50,
				legendary: 20,
				lucky: 1,
			},
		},
		{
			name: 'Lure',
			description: 'Artificial fish bait for any predatory fish species.',
			rarity: 'ultra',
			price: 2500,
			shopItem: true,
			capabilities: ['weak', 'strong', '2 count', '3'],
			biomes: ['river', 'lake', 'pond', 'ocean', 'coast', 'swamp'],
			multiplier: 1.5,
			weights: {
				common: 7000,
				uncommon: 2500,
				rare: 1000,
				ultra: 200,
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
