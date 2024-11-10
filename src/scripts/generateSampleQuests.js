// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Quest } = require('../schemas/QuestSchema');
const { Rod } = require('../schemas/RodSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		// Generate and publish sample quests
		generateSampleQuests();
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

// Function to generate sample quests
async function generateSampleQuests() {
	// Define an array of sample quest data
	const sampleQuests = [
		{
			title: 'Catch 15 Trout',
			description: 'Catch 15 trout from the river.',
			reward: [],
			cash: 500,
			xp: 450,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['rainbow trout', 'golden trout'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 15,
			daily: false,
			repeatable: true,
			type: 'quest',
		},
		{
			title: 'Catch 15 Carp',
			description: 'Catch 15 carp from the river.',
			reward: [],
			cash: 350,
			xp: 500,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['carp'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 15,
			daily: false,
			repeatable: true,
			type: 'quest',
		},
		{
			title: 'Find the Lucky Magikarp',
			description: 'Embark on a journey to find and catch the lucky magikarp.',
			reward: [],
			cash: 1000,
			xp: 2000,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['magikarp'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 1,
			daily: false,
			repeatable: true,
			type: 'quest',
		},
		{
			title: 'Help the Village!',
			description: 'Assist the local village by catching 30 fish for them.',
			reward: [],
			cash: 3000,
			xp: 300,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 30,
			daily: false,
			repeatable: true,
			type: 'quest',
		},
		{
			title: 'Lucky Fisher',
			description: 'Catch 25 lucky fish.',
			reward: [await Rod.findOne({ name: 'Lucky Rod' })],
			cash: 3000,
			xp: 3000,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['lucky'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 25,
			daily: false,
			repeatable: true,
			type: 'quest',
		},

		// Daily quests
		{
			title: 'Catch 100 Fish',
			description: 'Catch 100 fish a day.',
			reward: [],
			cash: 500,
			xp: 500,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 100,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 250 Fish',
			description: 'Catch 250 fish a day.',
			reward: [],
			cash: 500,
			xp: 500,
			requirements: {
				level: 20,
				previous: ['Catch 100 Fish'],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 250,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 500 Fish',
			description: 'Catch 500 fish a day.',
			reward: [],
			cash: 1000,
			xp: 1000,
			requirements: {
				level: 30,
				previous: ['Catch 250 Fish'],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 500,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 750 Fish',
			description: 'Catch 750 fish a day.',
			reward: [],
			cash: 2000,
			xp: 2000,
			requirements: {
				level: 40,
				previous: ['Catch 500 Fish'],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 750,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Professional Fisher',
			description: 'Catch 1000 fish to prove your dedication to the art of fishing.',
			reward: [],
			cash: 4000,
			xp: 4000,
			requirements: {
				level: 50,
				previous: ['Catch 750 Fish'],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 1000,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 1 Legendary Fish',
			description: 'Catch 1 legendary fish.',
			reward: [],
			cash: 3000,
			xp: 1500,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['legendary'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 1,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 5 Ultra Fish',
			description: 'Catch 5 Ultra fish.',
			reward: [],
			cash: 2000,
			xp: 1500,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['ultra'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 5,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 15 Rare Fish',
			description: 'Catch 15 Rare fish.',
			reward: [],
			cash: 1000,
			xp: 1500,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['rare'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 15,
			daily: true,
			type: 'quest',
		},

		// Advanced quests
		{
			"title": "Storm Chaser",
			"description": "During a fierce storm, rare fish are rumored to appear. Prove your skills by catching the elusive \"Flashfin Salmon\" in the rain.",
			"reward": [],
			"cash": 5000,
			"xp": 1000,
			"requirements": {
				"level": 10,
				"previous": [],
				"weather": "rainy",
				"timeOfDay": "any",
			},
			"progressType": {
				"fish": ["Flashfin Salmon"],
				"rarity": ["Ultra"],
				"rod": "any",
				"qualities": ["any"],
			},
			"progressMax": 1,
			"daily": false,
			"repeatable": false,
			"fishable": false,
			"type": "quest"
			
		}
	];

	// Loop through the sample quests and create new quest documents
	sampleQuests.forEach((questData) => {
		const quest = new Quest(questData);
		quest.save()
			.then(() => {
				console.log(`Quest "${quest.title}" created successfully`);
			})
			.catch((error) => {
				console.error(`Error creating quest "${quest.title}":`, error);
			});
	});
}
