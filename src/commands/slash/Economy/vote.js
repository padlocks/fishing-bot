const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User, getUser } = require('../../../class/User');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Claim your voting rewards! Vote now at top.gg!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {

		await interaction.deferReply();

		const user = new User(await getUser(interaction.user.id));
		const vote = await user.vote();

		await interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.addFields(
						{ name: `${vote.voted ? 'Success' : 'Failure'}`, value: vote.message },
					),
			],
		});

	},
};
