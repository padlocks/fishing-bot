const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const buttonPagination = require('../../../buttonPagination');
const { QuestData } = require('../../../schemas/QuestSchema');
const { log } = require('../../../util/Utils');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('quests')
		.setDescription('Check your quests!'),
	options: {
		cooldown: 15000,
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

			let fields = [];
			fields = quests.map((q) => ({
				name: q.title,
				value: `${q.description}\n
					**Rewards:** $${q.cash}, ${q.xp} XP ${q.reward.length > 0 ? q.reward.join(', ') : ''}
					**Progress:** ${q.progress}/${q.progressMax}
					---------`,
				inline: true,
			}));

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
			log(err, 'err');
		}
	},
};
