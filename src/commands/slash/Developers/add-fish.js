/* eslint-disable no-negated-condition */
const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const {Fish} = require('../../../schemas/FishSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('add-fish')
		.setDescription('Adds fish to fishing pool.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('Name of the fish.')
				.setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('rarity')
				.setDescription('Rarity of the fish.')
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option
				.setName('value')
				.setDescription('Value of the fish.')
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
			let fishData = (await Fish.findOne({name}));
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
