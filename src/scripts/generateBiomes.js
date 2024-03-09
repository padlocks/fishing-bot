// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Biome } = require('../schemas/BiomeSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		// Generate and publish sample biomes
		generateBiomes();
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

// Function to generate sample biomes
function generateBiomes() {
	// Define an array of sample biome data
	const sampleBiomes = [
		{
			name: 'Ocean',
			requirements: ['Level 0'],
			icon: {
				animated: false,
				data: 'rawfish:1209352519726276648',
			},
		},
		{
			name: 'River',
			requirements: ['Level 10'],
			icon: {
				animated: false,
				data: 'rawfish:1209352519726276648',
			},
		},
		{
			name: 'Lake',
			requirements: ['Level 20'],
			icon: {
				animated: false,
				data: 'rawfish:1209352519726276648',
			},
		},
		{
			name: 'Pond',
			requirements: ['Level 30'],
			icon: {
				animated: false,
				data: 'rawfish:1209352519726276648',
			},
		},
		{
			name: 'Coast',
			requirements: ['Level 40'],
			icon: {
				animated: false,
				data: 'rawfish:1209352519726276648',
			},
		},
		{
			name: 'Swamp',
			requirements: ['Level 50'],
			icon: {
				animated: false,
				data: 'rawfish:1209352519726276648',
			},
		},
	];

	// Loop through the sample biomes and create new biome documents
	sampleBiomes.forEach((biomeData) => {
		const biome = new Biome(biomeData);
		biome.save()
			.then(() => {
				console.log(`Biome "${biome.name}" created successfully`);
			})
			.catch((error) => {
				console.error(`Error creating biome "${biome.name}":`, error);
			});
	});
}
