const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { generateDailyQuest, getQuests } = require('../../../util/Quest');

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
		// check if user already has an incomplete daily quest
		const userQuests = await getQuests(interaction.user.id);
		const dailyQuests = userQuests.filter((quest) => quest.daily);
		const incompleteDailyQuests = dailyQuests.filter((quest) => quest.status === 'in_progress');
		if (incompleteDailyQuests.length > 0) {
			return await interaction.reply({
				content: 'You already have a daily quest in progress. Come back tomorrow!',
				ephemeral: true,
			});
		}

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
