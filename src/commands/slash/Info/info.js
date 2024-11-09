const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../../class/User');
const { ItemData } = require('../../../schemas/ItemSchema');
const { WeatherPattern } = require('../../../class/WeatherPattern');
const buttonPagination = require('../../../buttonPagination');
const { Season } = require('../../../class/Season');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Check various information!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('rod')
				.setDescription('Check your current fishing rod.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('weather')
				.setDescription('Check the current weather.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('forecast')
				.setDescription('Check the weather forecast.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('season')
				.setDescription('Check the current season.')),
	options: {
		cooldown: 10_000,
	},
	/**
	 * @param {ExtendedClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	run: async (client, interaction, analyticsObject) => {
		const subcommand = interaction.options.getSubcommand();
		
		if (subcommand === 'rod') {
			const user = new User(await User.get(interaction.user.id));
			const rodId = await user.getEquippedRod();
			const rod = await ItemData.findById(rodId);

			const embed = new EmbedBuilder()
				.setTitle('Fishing Rod Information')
				.addFields(
					{ name: 'Rod', value: `<${rod.icon?.animated ? 'a' : ''}:${rod.icon?.data}> **${rod.rarity}** ${rod.name}`, inline: false },
					{ name: 'Description', value: rod.description, inline: false },
					{ name: 'Durability', value: `${rod.durability}/${rod.maxDurability}`, inline: true },
					{ name: 'State', value: `${rod.state} - ${rod.maxRepairs - rod.repairs}/${rod.maxRepairs} repairs left\nRepair Cost: $${rod.repairCost}`, inline: true },
				)
				.setColor('Green');

			await interaction.reply({ embeds: [embed] });
		}
		else if (subcommand === 'weather') {
			try {
				const weather = await WeatherPattern.getCurrentWeather();
				const weatherType = await weather.getWeather();
				const dateStart = new Date(await weather.getDateStart());
				const dateEnd = new Date(await weather.getDateEnd());

				const nextWeatherPatten = await weather.getNextWeatherPattern();
				const nextWeather = await nextWeatherPatten.getWeather();


				const embed = new EmbedBuilder()
					.setTitle('Today\'s Weather')
					.addFields(
						{ name: 'Weather', value: weatherType, inline: false },
						{ name: 'Date Start', value: dateStart.toLocaleDateString(), inline: true },
						{ name: 'Date End', value: dateEnd.toLocaleDateString(), inline: true },
						{ name: 'Tomorrow\'s Weather', value: nextWeather, inline: false },
					)
					.setColor('Blue');

				await interaction.reply({ embeds: [embed] });
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error fetching the weather information.', ephemeral: true });
			}
		}
		else if (subcommand === 'forecast') {
			const forecast = await WeatherPattern.getSevenDayForecast();
			const pages = await Promise.all(forecast.map(async day => {
				const startDate = new Date(await day.getDateStart());
				const weatherType = await day.getWeather();
				return new EmbedBuilder()
					.setTitle('7-Day Weather Forecast')
					.addFields(
						{ name: 'Date', value: startDate.toLocaleDateString(), inline: false },
						{ name: 'Weather', value: weatherType, inline: false },
					)
					.setColor('Blue')
					.setFooter({ text: `Page ${forecast.indexOf(day) + 1}/${forecast.length}`});
			}));

			await buttonPagination(interaction, pages);
		}
		else if (subcommand === 'season') {
			const season = await Season.getCurrentSeason();
			const embed = new EmbedBuilder()
				.setTitle('Current Season')
				.addFields(
					{ name: 'Season', value: season.season, inline: false },
					{ name: 'Start Date', value: `${season.startMonth} ${season.startDay}`, inline: true },
					{ name: 'Common Weather Types', value: season.commonWeatherTypes.join(', '), inline: true },
				)
				.setColor('Blue');

			await interaction.reply({ embeds: [embed] });
		}
	},
};
