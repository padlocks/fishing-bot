const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const {Fish} = require('../../../schemas/FishSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('remove-fish')
		.setDescription('Removes fish from fishing pool.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('Name of the fish.')
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

		try {
			await Fish.findOneAndDelete({name});

			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Fish Removed')
						.setDescription('Successfully removed the fish from the registry.')
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
