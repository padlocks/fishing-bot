const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const { Fish } = require('../../../class/Fish');
const config = require('../../../config');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('sell')
		.setDescription('Sells fish by rarity.')
		.addStringOption((option) =>
			option
				.setName('rarity')
				.setDescription('Rarity of the fishes you wish to sell.')
				.setRequired(true),
		),
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
	run: async (client, interaction, analyticsObject) => {
		await interaction.deferReply();

		let sold = 0;
		const rarity = interaction.options.getString('rarity');

		sold = await Fish.sellByRarity(interaction.user.id, rarity);

		if (process.env.ANALYTICS || config.client.analytics) {
			await analyticsObject.setStatus('completed');
			await analyticsObject.setStatusMessage('Sold fish.');
		}
		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Fish Sold')
					.setDescription(`Successfully sold **${rarity}** fish for $${sold}.`)
					.setColor('Green'),
			],
		});

	},
};
