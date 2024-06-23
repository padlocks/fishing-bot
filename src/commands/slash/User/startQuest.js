const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const { Quest } = require('../../../schemas/QuestSchema');
const { User } = require('../../../class/User');
const { startQuest, getQuests } = require('../../../util/Quest');
const config = require('../../../config');
const { Interaction } = require('../../../class/Interaction');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('start-quest')
		.setDescription('Start a quest!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction, analyticsObject, user = null) {
		if (user === null) user = interaction.user;

		const questOptions = await Quest.find({ daily: false });
		const uniqueValues = new Set();

		let options = [];
		const questPromises = questOptions.map(async (q) => {
			try {
				const value = q._id.toString();

				if (!uniqueValues.has(value)) {
					uniqueValues.add(value);

					return new StringSelectMenuOptionBuilder()
						.setLabel(q.title)
						.setDescription(`$${q.cash}, ${q.xp} XP ${q.reward.length > 0 ? q.reward.join(', ') : ''} | ${q.description}`)
						// .setEmoji(q.toJSON().icon.data.split(':')[1])
						.setValue(value);
				}

			}
			catch (error) {
				console.error(error);
			}
		});

		options = await Promise.all(questPromises);
		options = options.filter((option) => option !== undefined);

		const select = new StringSelectMenuBuilder()
			.setCustomId('start-quest')
			.setPlaceholder('Make a selection!')
			.addOptions(options);

		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			content: 'Which quest would you like to start?',
			components: [row],
		});

		const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 15000 });
		collector.on('collect', async i => {
			if (process.env.ANALYTICS || config.client.analytics) {
				await Interaction.generateCommandObject(i, analyticsObject);
			}

			let canAccept = true;
			const selection = i.values[0];
			const userData = new User(await User.get(user.id));
			const originalQuest = await Quest.findById(selection);

			// Check if user meets quest requirements
			const reqLevel = originalQuest.requirements.level;
			const level = await userData.getLevel();
			if (level < reqLevel) {
				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('failed');
					await analyticsObject.setStatusMessage('User does not meet level requirements');
				}
				canAccept = false;
				await i.reply({
					content: `You need to be level ${reqLevel} to start this quest!`,
					ephemeral: true,
				});
				return;
			}

			if (originalQuest.requirements.previous.length > 0) {
				const existingQuests = await getQuests(user.id) || [];
				const hasPrevious = existingQuests.some(quest => originalQuest.requirements.previous.includes(quest.title) && quest.status === 'completed');

				if (!hasPrevious) {
					if (process.env.ANALYTICS || config.client.analytics) {
						await analyticsObject.setStatus('failed');
						await analyticsObject.setStatusMessage('User does not meet previous quest requirements');
					}
					canAccept = false;
					await i.reply({
						content: `You need to complete the previous quest(s) to start this quest!\n\n**Required Quests:**\n${originalQuest.requirements.previous.join('\n')}`,
						ephemeral: true,
					});
					return;
				}
			}

			const existingQuest = await getQuests(user.id) || [];
			const hasExistingQuest = existingQuest.some(quest => quest.title === originalQuest.title && quest.status === 'in_progress');

			if (hasExistingQuest) {
				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('failed');
					await analyticsObject.setStatusMessage('User already has quest');
				}
				await i.reply({
					content: `You already have a quest with the title **${originalQuest.title}**!`,
					ephemeral: true,
				});
				return;
			}
			else if (canAccept) {
				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('completed');
					await analyticsObject.setStatusMessage('Quest started.');
				}
				await startQuest(await userData.getUserId(), originalQuest._id);
				await i.reply(`${i.user} has started quest **${originalQuest.title}**!`);
			}
		});
		collector.on('end', async () => {
			await response.edit({
				components: [],
			});
		});
	},
};
