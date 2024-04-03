const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../../../util/User');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('collection')
		.setDescription('Check your fish collection!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {

		await interaction.deferReply();

		let money = 0;
		const user = await getUser(interaction.user.id);
		if (user) {
			money = user.inventory.money;
		}

		await interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setTitle('Bank')
					.addFields(
						{ name: 'Current Balance', value: `You currently have **$${money}**.` },
					),
			],
		});

	},
};
