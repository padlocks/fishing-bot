const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../../schemas/UserSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check how much money you have!'),
	options: {
		cooldown: 15000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {

		await interaction.deferReply();

		let money = 0;
		const user = await User.findOne({ userId: interaction.user.id });
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