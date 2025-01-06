const { WeatherType } = require("../schemas/WeatherTypeSchema");
const { Season: SeasonSchema } = require("../schemas/SeasonSchema");

class Season {
	static async getCurrentSeason() {
		const currentSeason = await SeasonSchema.findOne({ active: true });
		return currentSeason;
	}

	static async getSeasonalWeather(season) {
		// Fetch all available weather types
		const weatherTypes = await WeatherType.find({ type: 'weather' });
	
		// Separate weather types associated with the season and those that aren't
		const seasonWeatherTypes = season.commonWeatherTypes;
		const associatedWeatherTypes = weatherTypes.filter(weatherType =>
			seasonWeatherTypes.includes(weatherType.weather)
		);
		const otherWeatherTypes = weatherTypes.filter(weatherType =>
			!seasonWeatherTypes.includes(weatherType.weather)
		);
	
		// Create a weighted list to increase the probability of seasonal weather types
		const weightedWeather = [];
	
		// Increase the weight of seasonal weather types
		for (let weather of associatedWeatherTypes) {
			weightedWeather.push(weather, weather, weather, weather, weather);
		}
	
		// Add non-seasonal weather types with lower weight
		for (let weather of otherWeatherTypes) {
			weightedWeather.push(weather);
		}
	
		// Randomly select a weather type from the weighted list
		const randomWeather = weightedWeather[Math.floor(Math.random() * weightedWeather.length)];
	
		return randomWeather;
	}

	static async updateCurrentSeason() {
		const today = new Date();
		const currentMonth = today.getMonth();
		const currentDay = today.getDate();
	
		const isSeasonBeforeToday = (season) => {
			const seasonMonthNum = new Date(`${season.startMonth} 1, ${today.getFullYear()}`).getMonth();
			return (
				seasonMonthNum < currentMonth ||
				(seasonMonthNum === currentMonth && season.startDay <= currentDay)
			);
		};
	
		// Find the most recent season whose start date is on or before today
		const seasons = await SeasonSchema.find();
		const recentSeason = seasons
			.filter(isSeasonBeforeToday)
			.reduce((latest, season) => {
				const seasonMonthNum = new Date(`${season.startMonth} 1, ${today.getFullYear()}`).getMonth();
				const latestMonthNum = new Date(`${latest.startMonth} 1, ${today.getFullYear()}`).getMonth();
				if (
					seasonMonthNum > latestMonthNum ||
					(seasonMonthNum === latestMonthNum && season.startDay > latest.startDay)
				) {
					return season;
				}
				return latest;
			}, seasons[0]);
	
		// Fetch the active season from the database
		const activeSeason = await SeasonSchema.findOne({ active: true });
	
		// Check if the correct season is already active
		if (!activeSeason || activeSeason.season !== recentSeason.season) {
			// Deactivate the current season
			if (activeSeason) {
				activeSeason.active = false;
				await activeSeason.save();
			}
	
			// Find and activate the correct season in the database
			let newSeason = await SeasonSchema.findOne({ season: recentSeason.season });
			if (!newSeason) {
				// If the season doesn't exist in the database, create it
				newSeason = new SeasonSchema({ ...recentSeason, active: true });
			} else {
				// Activate the found season
				newSeason.active = true;
			}
			await newSeason.save();
			console.log(`Season updated to ${newSeason.season}`);
		} else {
			// console.log(`The current season (${activeSeason.season}) is still active.`);
		}
	}
}

module.exports = { Season };
