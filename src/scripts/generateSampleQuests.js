// Import the necessary modules
const mongoose = require('mongoose');
const { Quest } = require('../schemas/QuestSchema');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fishing-bot-test', { useNewUrlParser: true, useUnifiedTopology: true })
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
			title: 'Catch 5 Trout',
			description: 'Catch 5 trout from the river.',
			reward: ['50 money'],
			xp: 100,
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['rainbow trout', 'golden trout'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 5,
		},
		{
			title: 'Catch 15 Carp using Lucky Rod',
			description: 'Catch 15 carp from the river.',
			reward: ['350 money'],
			xp: 500,
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['carp'],
				rod: 'lucky rod',
				qualities: ['any'],
			},
			progressMax: 15,
		},
		{
			title: 'Find the Legendary Magikarp',
			description: 'Embark on a journey to find and catch the legendary magikarp.',
			reward: ['1000 money'],
			xp: 400,
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['magikarp'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 1,
		},
		{
			title: 'Help the Fishermen',
			description: 'Assist the local fishermen by catching 10 fish for them.',
			reward: ['50 money'],
			xp: 50,
			// requirements: ['Old Rod'],
			progressType: {
				fish: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 10,
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
