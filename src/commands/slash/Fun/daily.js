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
		const quest = await generateDailyQuest(interaction.user.id);

		if (!quest) {
			return await interaction.reply({
				content: 'You have already accepted or completed your daily quest. Come back tomorrow!',
				ephemeral: true,
			});
		}
		else {
			await interaction.reply({
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
