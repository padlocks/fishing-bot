/* eslint-disable no-negated-condition */
const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const {Quest} = require('../../../schemas/QuestSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('add-quest')
		.setDescription('Adds quest to questing pool.')
		.addStringOption(option =>
			option
				.setName('title')
				.setDescription('Title of the quest')
				.setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('description')
				.setDescription('Description for the quest.')
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option
				.setName('xp')
				.setDescription('XP value for the quest')
				.setRequired(true),
		),
	options: {
		developers: true,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
	async run(client, interaction) {
		await interaction.deferReply();

		const name = interaction.options.getString('name');
		const rarity = interaction.options.getString('rarity');
		const value = interaction.options.getInteger('value');

		try {
			let fishData = (await Quest.findOne({title}));
			if (!fishData) {
				fishData = new Fish({
					name,
					rarity,
					value,
				});
				fishData.save();
			} else {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle('Error')
							.setDescription('Fish with name already exists.')
							.setColor('Red'),
					],
				});
			}

			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Fish Added')
						.setDescription('Successfully added the fish to the registry.')
						.setColor('Green'),
				],
			});
		} catch (_) {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Error')
						.setDescription('Something went wrong.')
						.setColor('Red'),
				],
			});
		}
	},
};
