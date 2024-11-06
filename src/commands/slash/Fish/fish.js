const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const { Fish } = require('../../../class/Fish');
const { Quest } = require('../../../class/Quest');
const { Pond } = require('../../../schemas/PondSchema');
const { Item } = require('../../../schemas/ItemSchema');
const { User } = require('../../../class/User');
const config = require('../../../config');
const { Interaction } = require('../../../class/Interaction');

const updateUserWithFish = async (interaction, userId) => {
	const user = new User(await User.get(userId));
	const pond = await Pond.findOne({ id: interaction.channel.id });
	if (pond && pond.count <= 0) {
		return { fish: [], questsCompleted: [], xp: 0, rodState: '', success: false, message: 'The pond is empty!' };
	}
	let rod = await user.getEquippedRod();
	const bait = await user.getEquippedBait();
	const biome = await user.getCurrentBiome();
	const fishArray = await Fish.reel(rod._id, bait, biome, interaction.guild.id, user);
	let xp = 0;
	let levelUp = false;

	for (let i = 0; i < fishArray.length; i++) {
		xp += await user.generateBoostedXP();
	}

	if (bait) {
		xp = Math.floor(xp * bait.multiplier);
	}

	const completedQuests = [];
	// const user = await User.get(userId);
	if (user) {
		const stats = await user.getStats();
		stats.latestFish = [];
		if (bait) {
			bait.count -= fishArray.reduce((acc, f) => acc + (f.count || 1), 0);
			if (bait.count <= 0) {
				await user.setEquippedBait(null);
				// delete bait from user inventory
				await user.removeBait(bait._id);
			}
		}
		for (let i = 0; i < fishArray.length; i++) {
			const f = fishArray[i];
			if (!f.count) f.count = 1;

			// await user.sendToInventory(f._id, f.count);

			let message = '';
			switch (rod.state) {
			case 'broken':
				message = `Your rod is ${rod.state}! You can't catch any more fish until you repair it.`;
				break;
			case 'destroyed':
				message = `Your rod is ${rod.state}! You can't use it anymore.`;
				break;
			default:
				message = '';
				break;
			}

			if (rod.state === 'broken' || rod.state === 'destroyed') {
				return { fish: [], questsCompleted: [], xp: 0, rodState: rod.state, success: false, message: message };
			}
			else {
				rod = await user.decreaseRodDurability(f.count || 1);
			}

			rod.fishCaught += f.count || 1;
			stats.fishCaught += f.count || 1;
			stats.latestFish.push(f);
			stats.soldLatestFish = false;
			stats.fishStats.set(f.name.toLowerCase(), (stats.fishStats.get(f.name.toLowerCase()) || 0) + (f.count || 1));
			await user.setStats(stats);
			await user.addXP(xp);
			levelUp = await user.updateLevel();

			if (pond) {
				pond.count -= f.count || 1;
				if (pond.count <= 0) {
					pond.count = 0;
				}
				else if (pond.count <= 250 && !pond.warning) {
					pond.warning = true;
					await pond.save();
					await interaction.followUp({
						embeds: [
							new EmbedBuilder()
								.setTitle('Pond')
								.addFields({ name: 'Pond Status', value: `The pond is running low! There are only ${pond.count} fish left!` }),
						],
					});
				}
				pond.lastFished = Date.now();
				await pond.save();
			}

			// quest stuff
			const quests = await user.findQuests(f.name.toLowerCase(), rod.name.toLowerCase(), f.qualities.map(q => q.toLowerCase()));

			for (let j = 0; j < quests.length; j++) {
				const quest = new Quest(quests[j]);
				fishArray.forEach(async (oneFish) => {
					// check to see if fish matches progressType
					const questProgress = {
						fish: false,
						rarity: false,
						rod: false,
						qualities: false,
					};

					const progressType = await quest.getProgressType();

					if (progressType.fish.includes('any') || progressType.fish.includes(oneFish.name.toLowerCase())) questProgress.fish = true;
					if (progressType.rarity.includes('any') || progressType.rarity.includes(oneFish.rarity.toLowerCase())) questProgress.rarity = true;
					if (progressType.rod === 'any' || progressType.rod === rod.name.toLowerCase()) questProgress.rod = true;
					if (progressType.qualities.includes('any') || progressType.qualities.some(q => oneFish.qualities.map(quality => quality.toLowerCase()).includes(q))) questProgress.qualities = true;

					if (questProgress.fish && questProgress.rarity && questProgress.rod && questProgress.qualities) {
						await quest.setProgress(await quest.getProgress() + (oneFish.count || 1));
					}
				});
				if (await quest.getProgress() >= await quest.getMaxProgress()) {
					await user.addXP(await quest.getXP());
					if (await user.updateLevel()) levelUp = true;
					await user.addMoney(await quest.getCash());

					const reward = await quest.getReward();
					if (reward && reward.length > 0) {
						reward.forEach(async (r) => {
							await user.sendToInventory(r);
						});
					}

					quest.end();
					completedQuests.push(quest);
				}
				// await quest.save();
			}
			// end quest stuff

			await f.save();
		}

		await rod.save();
		if (bait) await bait.save();
		// await user.save();
		return { fish: fishArray, questsCompleted: completedQuests.filter((quest, index, self) => self.findIndex(async q => await q.getTitle() === await quest.getTitle()) === index), xp: xp, rodState: rod.state, bait: bait, levelUp: levelUp, success: true, message: '' };
	}
};

const followUpMessage = async (interaction, user, fishArray, completedQuests, xp, rodState, bait, levelUp, success, message) => {
	const fields = [];
	let fishString = '';
	let questString = '';
	let totalQuestXp = 0;
	let totalQuestCash = 0;
	const questRewards = [];
	let fishAgainDisabled = false;
	const userObj = new User(await User.get(user.id));

	if (success) {
		fishArray.forEach(f => {
			fishString += `<${f.icon?.animated ? 'a' : ''}:${f.icon?.data}> ${f.count} **${f.rarity}** ${f.name}\n`;
			// fields.push({ name: 'Congratulations!', value: `<${f.icon?.animated ? 'a' : ''}:${f.icon?.data}> ${user.globalName} caught ${f.count} **${f.rarity}** ${f.name}!` });
		});

		fishString += `+ ${xp} XP\n`;
		fields.push({ name: `${user.globalName} Caught:`, value: fishString });

		if (completedQuests.length > 0) {
			for await (const quest of completedQuests) {
				questString += `**${await quest.getTitle()}** completed\n`;
				totalQuestXp += await quest.getXP();
				totalQuestCash += await quest.getCash();

				const reward = await quest.getReward();
				if (reward && reward.length > 0) {
					for await (const rew of reward) {
						const r = await Item.findById(rew);
						questRewards.push(r.name);
					}
				}
				// fields.push({ name: 'Quest Completed!', value: `**${quest.title}** completed!` });
			}
			questString += `+ ${totalQuestXp} XP, + $${totalQuestCash}\n ${questRewards.length > 0 ? questRewards.join(', ') : ''}`;
			fields.push({ name: 'Quest complete:', value: questString });
		}
		if (rodState === 'broken') {
			fishAgainDisabled = true;
			fields.push({ name: 'Uh oh!', value: 'Your fishing rod has broken!' });
		}
		else if (rodState === 'destroyed') {
			fishAgainDisabled = true;
			fields.push({ name: 'Uh oh!', value: 'Your fishing rod has been destroyed! Looks like you need to buy a new one..' });
		}

		if (bait?.count <= 0) {
			fields.push({ name: 'Uh oh!', value: 'You ran out of bait!' });
		}

		if (levelUp) {
			fields.push({ name: 'Level Up!', value: `${user.globalName} has leveled up to level **${await userObj.getLevel()}**!` });
		}
	}
	else {
		fields.push({ name: 'Uh oh!', value: message });
		fishAgainDisabled = true;
	}

	let components = [
		new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('fish-again')
					.setLabel('Fish again!')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(fishAgainDisabled),
				new ButtonBuilder()
					.setCustomId('sell-one-fish')
					.setLabel('Sell')
					.setStyle(ButtonStyle.Danger)
					.setDisabled(fishArray.length === 0),
			),
	];

	if (rodState === 'broken') {
		components = [
			new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('repair-rod')
						.setLabel('Repair Rod')
						.setStyle(ButtonStyle.Primary),
				),
		];
	}

	return await interaction.followUp({
		embeds: [
			new EmbedBuilder()
				.setTitle('Fished!')
				.addFields(
					fields,
				),
		],
		components: components,
	});
};

module.exports = {
	customId: 'fish-again',
	structure: new SlashCommandBuilder()
		.setName('fish')
		.setDescription('Fish!'),
	options: {
		cooldown: 5000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction, analyticsObject, user = null) {
		if (user === null) user = interaction.user;

		await interaction.deferReply();

		const object = await updateUserWithFish(interaction, user.id);
		const newFish = object.fish;
		const completedQuests = object.questsCompleted;
		const xp = object.xp;
		const rodState = object.rodState;
		const bait = object.bait;
		const levelUp = object.levelUp;
		const success = object.success;
		const message = object.message;

		if (process.env.ANALYTICS || config.client.analytics) {
			await analyticsObject.setStatus(success ? 'completed' : 'failed');
			await analyticsObject.setStatusMessage(message || 'Fished.');
		}

		const followUp = await followUpMessage(interaction, user, newFish, completedQuests, xp, rodState, bait, levelUp, success, message);

		// const filter = () => interaction.user.id === interaction.message.author.id;

		const collector = followUp.createMessageComponentCollector({
			componentType: ComponentType.Button,
			// filter,
			time: 30_000,
		});

		collector.on('collect', async collectionInteraction => {
			if (collectionInteraction.user.id !== user.id) return;
			if (collectionInteraction.customId === 'fish-again') {
				if (process.env.ANALYTICS || config.client.analytics) {
					await Interaction.generateCommandObject(collectionInteraction, analyticsObject);
				}
				await this.run(client, collectionInteraction, analyticsObject, user);
			}
		});

		collector.on('end', async () => {
			await followUp.edit({
				components: [],
			});
		});
	},
};