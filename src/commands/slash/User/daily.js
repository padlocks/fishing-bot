const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { generateDailyQuest, getQuests } = require('../../../util/Quest');
const { Item } = require('../../../schemas/ItemSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Pickup your daily quest!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction, analyticsObject) => {
		// check if user already has an incomplete daily quest
		const userQuests = await getQuests(interaction.user.id);
		const dailyQuests = userQuests.filter((quest) => quest.daily);
		const incompleteDailyQuests = dailyQuests.filter((quest) => quest.status === 'in_progress');
		if (incompleteDailyQuests.length > 0) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('Daily quest already in progress.');
			}
			return await interaction.reply({
				content: 'You already have a daily quest in progress. Come back tomorrow!',
				ephemeral: true,
			});
		}

		const quest = await generateDailyQuest(interaction.user.id);

		if (!quest) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('Already completed daily quest.');
			}
			return await interaction.reply({
				content: 'You have already accepted or completed your daily quest. Come back tomorrow!',
				ephemeral: true,
			});
		}
		else {
			let value = '';
			const rewards = [];
			if (quest.reward.length > 0) {
				for await (const reward of quest.reward) {
					const rewardObject = await Item.findById(reward);
					rewards.push(rewardObject.name);
				}
			}

			const rewardsString = rewards.join(', ');
			if (rewards.length > 0) {
				value = `$${quest.cash}, ${quest.xp} XP, ${rewardsString}`;
			}
			else {
				value = `$${quest.cash}, ${quest.xp} XP`;
			}

			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('completed');
				await analyticsObject.setStatusMessage('Daily quest accepted.');
			}

			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Daily Quest: ${quest.title}`)
						.setDescription(quest.description)
						.addFields(
							{ name: 'Rewards', value: value },
						),
				],
			});
		}
	},
};
