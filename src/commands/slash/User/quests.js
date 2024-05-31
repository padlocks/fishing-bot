const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const buttonPagination = require('../../../buttonPagination');
const { QuestData } = require('../../../schemas/QuestSchema');
const { Item } = require('../../../schemas/ItemSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('quests')
		.setDescription('Check your quests!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {
		try {
			const embeds = [];
			const quests = await QuestData.find({ status: 'in_progress', user: interaction.user.id });

			if (!quests.length) {
				return await interaction.reply({
					content: 'You do not have any quests! Accept one using /start-quest or /daily.',
					ephemeral: true,
				});
			}

			const fields = [];
			for (const q of quests) {
				const rewards = [];

				if (q.reward.length > 0) {
					for (const reward of q.reward) {
						const rewardObject = await Item.findById(reward);
						rewards.push(rewardObject.name);
					}
				}

				fields.push({
					name: q.title,
					value: `${q.description}\n
						**Rewards:** $${q.cash}, ${q.xp} XP ${', ' + rewards.join(', ')}
						**Progress:** ${q.progress}/${q.progressMax}
						---------`,
					inline: true,
				});
			}

			const chunkSize = 6;

			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);

				embeds.push(new EmbedBuilder()
					.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
					.setTitle('Quests')
					.setColor('Green')
					.addFields(chunk),
				);
			}

			await buttonPagination(interaction, embeds);
		}
		catch (err) {
			console.error(err);
		}
	},
};
