const { Utils } = require('../../class/Utils');
// const fs = require('fs');
const { WeatherPattern: WeatherPatternSchema } = require('../../schemas/WeatherPatternSchema');
const { WeatherPattern } = require('../../class/WeatherPattern');
const { WeatherType } = require('../../schemas/WeatherTypeSchema');
const { Season: SeasonSchema } = require('../../schemas/SeasonSchema');
const { Season } = require('../../class/Season');

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

		// If there is no Season in the database, create them
		const seasons = await SeasonSchema.find({ type: 'season' });
		if (seasons.length === 0) {
			const seasonData = [
				{
					season: 'Spring',
					icon: {
						animated: false,
						data: 'Spring:1304870493882548304',
					},
					startMonth: 'March',
					startDay: '20',
					commonWeatherTypes: ['Rainy', 'Cloudy'],
				},
				{
					season: 'Summer',
					icon: {
						animated: false,
						data: 'Summer:1304870481987637402',
					},
					startMonth: 'June',
					startDay: '21',
					commonWeatherTypes: ['Sunny', 'Windy'],
				},
				{
					season: 'Fall',
					icon: {
						animated: false,
						data: 'Fall:1304870471430570174',
					},
					startMonth: 'September',
					startDay: '22',
					commonWeatherTypes: ['Rainy', 'Cloudy'],
				},
				{
					season: 'Winter',
					icon: {
						animated: false,
						data: 'Winter:1304870462441918504',
					},
					startMonth: 'December',
					startDay: '1',
					commonWeatherTypes: ['Snowy', 'Cloudy'],
				},
			];

			const currentDate = new Date();
			seasonData.forEach(async (season) => {
				const seasonStartDate = new Date(currentDate.getFullYear(), new Date(season.startMonth + ' ' + season.startDay).getMonth(), season.startDay);
				const nextSeasonIndex = (seasonData.indexOf(season) + 1) % seasonData.length;
				const nextSeason = seasonData[nextSeasonIndex];
				const nextSeasonStartDate = new Date(currentDate.getFullYear(), new Date(nextSeason.startMonth + ' ' + nextSeason.startDay).getMonth(), nextSeason.startDay);

				// Adjust for year transition
				if (nextSeasonStartDate < seasonStartDate) {
					nextSeasonStartDate.setFullYear(nextSeasonStartDate.getFullYear() + 1);
				}

				const isActive = currentDate >= seasonStartDate && currentDate < nextSeasonStartDate;

				const newSeason = new SeasonSchema({
					season: season.season,
					icon: season.icon,
					startMonth: season.startMonth,
					startDay: season.startDay,
					type: 'season',
					active: isActive,
					commonWeatherTypes: season.commonWeatherTypes,
				});

				await newSeason.save();
			});

			Utils.log('Created new Seasons', 'done');
		}

		// If there is no WeatherPattern in the database, create them
		await WeatherPatternSchema.findOne({ type: 'weather' }).then(async (weather) => {
			if (!weather) {
				let previousWeatherPattern = null;

				// Generate 7 days worth of weatherPatterns
				for (let i = 0; i < 7; i++) {
					const startDate = previousWeatherPattern ? new Date(await previousWeatherPattern.getDateEnd()) : new Date();
					const endDate = new Date(startDate);
					endDate.setDate(startDate.getDate() + 1);

					const randomWeather = new WeatherPattern(await Season.getSeasonalWeather(await Season.getCurrentSeason()));
					const icon = await WeatherType.findOne({ type: 'weather', weather: await randomWeather.getWeather() }).then((weatherType) => weatherType.icon);

					const newWeatherPattern = new WeatherPattern({
						weather: await randomWeather.getWeather(),
						dateStart: startDate,
						dateEnd: endDate,
						type: 'weather',
						icon : icon,
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