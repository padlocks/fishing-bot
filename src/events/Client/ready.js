const { Utils } = require('../../class/Utils');
// const fs = require('fs');
const { WeatherPattern: WeatherPatternSchema } = require('../../schemas/WeatherPatternSchema');
const { WeatherPattern } = require('../../class/WeatherPattern');
const { WeatherType } = require('../../schemas/WeatherTypeSchema');

module.exports = {
	event: 'ready',
	once: true,
	/**
     *
     * @param {ExtendedClient} _
     * @param {import('discord.js').Client<true>} client
     * @returns
     */
	run: async (_, client) => {

		Utils.log('Logged in as: ' + client.user.tag, 'done');

		// If there is no WeatherPattern in the database, create one
		const weatherTypes = await WeatherType.find({ type: 'weather' });
		await WeatherPatternSchema.findOne({ type: 'weather' }).then(async (weather) => {
			if (!weather) {
				let previousWeatherPattern = null;

				// Generate 7 days worth of weatherPatterns
				for (let i = 0; i < 7; i++) {
					const startDate = previousWeatherPattern ? new Date(await previousWeatherPattern.getDateEnd()) : new Date();
					const endDate = new Date(startDate);
					endDate.setDate(startDate.getDate() + 1);
				
					const newWeatherPattern = new WeatherPattern({
						weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)].weather,
						dateStart: startDate,
						dateEnd: endDate,
						type: 'weather',
						active: i === 0, // Only the first pattern is active
						nextWeatherPattern: null,
					});
				
					await newWeatherPattern.save();
				
					if (previousWeatherPattern) {
						previousWeatherPattern.setNextWeatherPattern(newWeatherPattern);
					}
				
					// Set the new pattern as the previous one for the next iteration
					previousWeatherPattern = newWeatherPattern;
				}

				Utils.log('Created new WeatherPattern', 'done');
			}
		});

		// const serverIds = ['1244064107834118244', '1244065421636931675'];

		// serverIds.forEach(async (serverId) => {
		// 	try {
		// 		const server = await client.guilds.fetch(serverId);
		// 		console.log(`Emojis in ${server.name}:`);

		// 		server.emojis.cache.forEach((emoji) => {
		// 			console.log(`${emoji.name}: ${emoji.url}`);
		// 			fs.appendFileSync('/Users/bee/Documents/Git/fishing-bot/src/scripts/emojis.txt', `${emoji.name}:${emoji.id}\n`);
		// 		});
		// 	}
		// 	catch (error) {
		// 		console.error(`Failed to fetch server with ID ${serverId}: ${error}`);
		// 	}
		// });

	},
};