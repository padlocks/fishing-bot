const { WeatherPattern: WeatherPatternSchema } = require('../schemas/WeatherPatternSchema');

class WeatherPattern {
	constructor(data) {
		this.weather = new WeatherPatternSchema(data);
	}

	save() {
		return WeatherPatternSchema.findOneAndUpdate({ _id: this.weather._id }, this.weather, { upsert: true });
	}

	async getId() {
		return this.weather._id;
	}

	async getWeather() {
		return this.weather.weather;
	}

	async getIcon() {
		return this.weather.icon;
	}

	async getType() {
		return this.weather.type;
	}

	async getDateStart() {
		return this.weather.dateStart;
	}

	async setDateStart(dateStart) {
		this.weather.dateStart = dateStart;
		await this.save();
	}

	async getDateEnd() {
		return this.weather.dateEnd;
	}

	async setDateEnd(dateEnd) {
		this.weather.dateEnd = dateEnd;
		await this.save();
	}

	async isActive() {
		const now = new Date();
		return this.weather.dateStart <= now && now <= this.weather.dateEnd;
	}

	async getNextWeatherPattern() {
		return new WeatherPattern(await WeatherPatternSchema.findById(this.weather.nextWeatherPattern));
	}

	async setNextWeatherPattern(nextWeatherPattern) {
		this.weather.nextWeatherPattern = await nextWeatherPattern.getId();
		await this.save();
	}

	async removeNextWeatherPattern() {
		this.weather.nextWeatherPattern = null;
		await this.save();
	}

	static async getCurrentWeather() {
		return new WeatherPattern(await WeatherPatternSchema.findOne({
			type: 'weather',
			active: true,
		}));
	}

	static async getSevenDayForecast() {
		const currentWeatherPattern = await WeatherPattern.getCurrentWeather();
		const forecast = [currentWeatherPattern];

		for (let i = 0; i < 6; i++) {
			const nextWeatherPattern = await forecast[i].getNextWeatherPattern();
			forecast.push(nextWeatherPattern);
		}

		return forecast;
	}
}

module.exports = { WeatherPattern };