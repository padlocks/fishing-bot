const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { generateDailyQuest } = require('../../../util/Quest');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Pickup your daily quest!'),
	options: {
		cooldown: 15000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {

		await interaction.deferReply();

		const quest = await generateDailyQuest(interaction.user.id);

		if (!quest) {return await interaction.followUp('You already have a daily quest!');}
		else {
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Daily Quest: ${quest.title}`)
						.setDescription(quest.description)
						.addFields(
							{ name: 'Rewards', value: `$${quest.cash}, ${quest.xp} XP` },
						),
				],
			});
		}
	},
};
