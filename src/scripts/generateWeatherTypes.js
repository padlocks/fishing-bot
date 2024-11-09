// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Fish } = require('../schemas/FishSchema');
const { WeatherType } = require('../schemas/WeatherTypeSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');

		const weatherTypes = [
			{
				weather: 'sunny',
			},
			{
				weather: 'rainy',
			},
			{
				weather: 'cloudy',
			},
			{
				weather: 'snowy',
			},
			{
				weather: 'windy',
			},
		];

		weatherTypes.forEach((weatherType) => {
			const w = new WeatherType(weatherType);
			w.save()
				.then(() => {
					console.log(`Weather "${w.weather}" created successfully`);
				})
				.catch((error) => {
					console.error(`Error creating weather "${w.weather}":`, error);
				});
		});

	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});