// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { WeatherType } = require('../schemas/WeatherTypeSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');

		const weatherTypes = [
			{
				weather: 'sunny',
				icon: {
					animated: true,
					data: 'SunAnimated:1304870451885117553',
				}
			},
			{
				weather: 'rainy',
				icon: {
					animated: true,
					data: 'RainAnimated:1304870440010907648',
				}
			},
			{
				weather: 'cloudy',
				icon: {
					animated: true,
					data: 'StormAnimated:1304870401033371722',
				}
			},
			{
				weather: 'snowy',
				icon: {
					animated: true,
					data: 'SnowAnimated:1304870416443113572',
				}
			},
			{
				weather: 'windy',
				icon: {
					animated: true,
					data: 'FallWindAnimated:1304870425645551746',
				}
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