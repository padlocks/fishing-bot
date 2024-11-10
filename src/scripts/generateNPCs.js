require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { NPC } = require('../class/NPC');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		generateNPCs();
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

async function generateNPCs() {
	// Define an array of NPC data
	const npcs = [
		{
			name: 'Oldman Jarvis',
			description: 'Knowledgable about the area, but a bit eccentric.',
			biome: 'River',
			availableTimes: [{ weather: 'rainy', timeOfDay: 'any', season: 'any' }],
			encounterTrigger: 'oldman_jarvis_event',
			dialogue: {
				initial: 'Hello there, young one. I have a tale to tell you.\n\nOnce upon a time, there was a great storm that swept through the valley. The river swelled and the fish were plentiful. But the storm was not without its dangers. The river was treacherous and many were lost to its depths. I have a feeling that another storm is coming. Be careful out there.',
				repeatable: ['Do you have any questions for me?', 'I have more stories to share.'],
				completion: 'Farewell, young one. May the river guide you.',
			},
			questTitlesAvailable: ['Storm Chaser'],
		}
		
	];

	// Loop create new documents
	npcs.forEach((npc) => {
		const person = new NPC(npc);
		person.save()
			.then(() => {
				console.log(`NPC "${npc.name}" created successfully`);
			})
			.catch((error) => {
				console.error(`Error creating NPC "${npc.name}":`, error);
			});
	});
}
