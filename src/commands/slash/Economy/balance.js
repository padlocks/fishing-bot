const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User, getUser } = require('../../../class/User');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check how much money you have!'),
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
		const user = new User(await getUser(interaction.user.id));
		if (user) {
			money = await user.getMoney();
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
