const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const buttonPagination = require('../../../buttonPagination');
const { log } = require('../../../functions');
const { QuestData } = require('../../../schemas/QuestSchema');

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

			let fields = [];
			fields = quests.map((q) => ({
				name: q.title,
				value: `${q.description}
					\n**Rewards:** ${q.reward.map((reward, index) => index === 0 ? `$${parseInt(reward.toLowerCase().split(' ')[0]) || 0}` : reward).join(', ')}, ${q.xp} XP
					\n**Progress:** ${q.progress}/${q.progressMax}`,
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
