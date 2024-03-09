// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Quest } = require('../schemas/QuestSchema');

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
function generateSampleQuests() {
	// Define an array of sample quest data
	const sampleQuests = [
		{
			title: 'Catch 15 Trout',
			description: 'Catch 15 trout from the river.',
			reward: [],
			cash: 500,
			xp: 450,
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['rainbow trout', 'golden trout'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 15,
			daily: false,
			type: 'quest',
		},
		{
			title: 'Catch 15 Carp',
			description: 'Catch 15 carp from the river.',
			reward: [],
			cash: 350,
			xp: 500,
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['carp'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 15,
			daily: false,
			type: 'quest',
		},
		{
			title: 'Find the Legendary Magikarp',
			description: 'Embark on a journey to find and catch the legendary magikarp.',
			reward: [],
			cash: 1000,
			xp: 2000,
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['magikarp'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 1,
			daily: false,
			type: 'quest',
		},
		{
			title: 'Help the Village!',
			description: 'Assist the local village by catching 30 fish for them.',
			reward: [],
			cash: 3000,
			xp: 300,
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 30,
			daily: false,
			type: 'quest',
		},
		{
			title: 'Catch 100 Fish',
			description: 'Catch 100 fish a day.',
			reward: [],
			cash: 500,
			xp: 500,
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['any'],
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
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['any'],
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
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['any'],
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
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['any'],
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
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 1000,
			daily: true,
			type: 'quest',
		},
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
