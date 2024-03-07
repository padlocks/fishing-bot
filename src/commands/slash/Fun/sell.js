const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const { sellFishByRarity } = require('../../../util/Fish');

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
	run: async (client, interaction) => {
		await interaction.deferReply();

		let sold = 0;
		const rarity = interaction.options.getString('rarity');

		sold = await sellFishByRarity(interaction.user.id, rarity);

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
