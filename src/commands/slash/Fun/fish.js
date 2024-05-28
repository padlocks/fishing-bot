const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const { getEquippedRod, getUser, decreaseRodDurability, getEquippedBait, setEquippedBait } = require('../../../util/User');
const { fish } = require('../../../util/Fish');
const { generateBoostedXP, sendToInventory } = require('../../../util/User');
const { findQuests } = require('../../../util/Quest');
const { Pond } = require('../../../schemas/PondSchema');
const { Item } = require('../../../schemas/ItemSchema');

const updateUserWithFish = async (interaction, userId) => {
	const pond = await Pond.findOne({ id: interaction.channel.id });
	if (pond && pond.count <= 0) {
		return { fish: [], questsCompleted: [], xp: 0, rodState: '', success: false, message: 'The pond is empty!' };
	}
	let rod = await getEquippedRod(userId);
	const bait = await getEquippedBait(userId);
	const biome = (await getUser(userId)).currentBiome;
	const fishArray = await fish(rod.name, bait, biome, userId);
	let xp = 0;

	for (let i = 0; i < fishArray.length; i++) {
		xp += await generateBoostedXP(userId);
	}

	if (bait) {
		xp = Math.floor(xp * bait.multiplier);
	}

	const completedQuests = [];
	const user = await getUser(userId);
	if (user) {
		user.stats.latestFish = [];
		if (bait) {
			bait.count--;
			if (bait.count <= 0) {
				await setEquippedBait(userId, null);
				// delete bait from user inventory
				user.inventory.baits.find((b, index) => {
					if (b.valueOf() === bait._id.valueOf()) {
						user.inventory.baits.splice(index, 1);
					}
				}, 0);
			}
		}
		for (let i = 0; i < fishArray.length; i++) {
			const f = fishArray[i];
			if (!f.count) f.count = 1;

			if (f.name.toLowerCase().includes('rod')) {
				user.inventory.rods.push(f);
			}
			else if (f.name.toLowerCase().includes('trophy')) {
				user.inventory.items.push(f);
			}
			else {
				user.inventory.fish.push(f);
			}

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
				rod = await decreaseRodDurability(userId, f.count || 1);
			}

			rod.fishCaught += f.count || 1;
			user.stats.fishCaught += f.count || 1;
			user.stats.latestFish.push(f);
			user.stats.soldLatestFish = false;
			user.stats.fishStats.set(f.name.toLowerCase(), (user.stats.fishStats.get(f.name.toLowerCase()) || 0) + (f.count || 1));
			user.xp += xp;

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
			const quests = await findQuests(f.name.toLowerCase(), rod.name.toLowerCase(), f.qualities.map(q => q.toLowerCase()));

			for (let j = 0; j < quests.length; j++) {
				const quest = quests[j];
				fishArray.forEach(oneFish => {
					// check to see if fish matches progressType
					const questProgress = {
						fish: false,
						rarity: false,
						rod: false,
						qualities: false,
					};

					if (quest.progressType.fish.includes('any') || quest.progressType.fish.includes(oneFish.name.toLowerCase())) questProgress.fish = true;
					if (quest.progressType.rarity.includes('any') || quest.progressType.rarity.includes(oneFish.rarity.toLowerCase())) questProgress.rarity = true;
					if (quest.progressType.rod === 'any' || quest.progressType.rod === rod.name.toLowerCase()) questProgress.rod = true;
					if (quest.progressType.qualities.includes('any') || quest.progressType.qualities.some(q => oneFish.qualities.map(quality => quality.toLowerCase()).includes(q))) questProgress.qualities = true;

					if (questProgress.fish && questProgress.rarity && questProgress.rod && questProgress.qualities) {
						quest.progress += oneFish.count || 1;
					}
				});
				if (quest.progress >= quest.progressMax) {
					quest.status = 'completed';
					user.xp += quest.xp;
					user.inventory.money += quest.cash;
					if (quest.reward && quest.reward.length > 0) {
						quest.reward.forEach(async reward => {
							await user.save();
							await sendToInventory(user.userId, reward);
						});
					}

					quest.endDate = Date.now();
					completedQuests.push(quest);
				}
				await quest.save();
			}
			// end quest stuff

			await f.save();
		}

		await rod.save();
		if (bait) await bait.save();
		await user.save();
		return { fish: fishArray, questsCompleted: completedQuests.filter((quest, index, self) => self.findIndex(q => q.title === quest.title) === index), xp: xp, rodState: rod.state, bait: bait, success: true, message: '' };
	}
};

const followUpMessage = async (interaction, user, fishArray, completedQuests, xp, rodState, bait, success, message) => {
	const fields = [];
	let fishString = '';
	let questString = '';
	let totalQuestXp = 0;
	let totalQuestCash = 0;
	const questRewards = [];
	let fishAgainDisabled = false;

	if (success) {
		fishArray.forEach(f => {
			fishString += `<${f.icon?.animated ? 'a' : ''}:${f.icon?.data}> ${f.count} **${f.rarity}** ${f.name}\n`;
			// fields.push({ name: 'Congratulations!', value: `<${f.icon?.animated ? 'a' : ''}:${f.icon?.data}> ${user.globalName} caught ${f.count} **${f.rarity}** ${f.name}!` });
		});

		fishString += `+ ${xp} XP\n`;
		fields.push({ name: `${user.globalName} Caught:`, value: fishString });

		if (completedQuests.length > 0) {
			for await (const quest of completedQuests) {
				questString += `**${quest.title}** completed\n`;
				totalQuestXp += quest.xp;
				totalQuestCash += quest.cash;
				for await (const reward of quest.reward) {
					const r = await Item.findById(reward);
					questRewards.push(r.name);
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
	async run(client, interaction, user = null) {
		if (user === null) user = interaction.user;

		await interaction.deferReply();

		const object = await updateUserWithFish(interaction, user.id);
		const newFish = object.fish;
		const completedQuests = object.questsCompleted;
		const xp = object.xp;
		const rodState = object.rodState;
		const bait = object.bait;
		const success = object.success;
		const message = object.message;

		const followUp = await followUpMessage(interaction, user, newFish, completedQuests, xp, rodState, bait, success, message);

		// const filter = () => interaction.user.id === interaction.message.author.id;

		const collector = followUp.createMessageComponentCollector({
			componentType: ComponentType.Button,
			// filter,
			time: 10000,
		});

		collector.on('collect', async collectionInteraction => {
			if (collectionInteraction.user.id !== user.id) return;
			if (collectionInteraction.customId === 'fish-again') {
				await this.run(client, collectionInteraction, user);
			}
			if (collectionInteraction.customId === 'sell-one-fish') {
				//
			}
			if (collectionInteraction.customId === 'repair-rod') {
				//
			}
		});
	},
};