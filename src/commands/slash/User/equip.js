const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { User } = require('../../../class/User');
const { ItemData } = require('../../../schemas/ItemSchema');
const config = require('../../../config');
const { Interaction } = require('../../../class/Interaction');
const ExpandableMessage = require('../../../class/ExpandableMessage');

const selectionOptions = async (inventoryPath, userData, allowNone = true) => {
	const uniqueValues = new Set();
	const counts = {};
	const ids = {};
	const desc = {};

	// Loop through inventory items
	for (const objectId of (await userData.getInventory())[inventoryPath]) {
		try {
			const item = await ItemData.findById(objectId.valueOf());
			const name = item.name;

			if (item.state && item.state === 'destroyed') continue;
			if (item.count <= 0) continue;

			if (uniqueValues.has(name)) {
				counts[name] += (item.count || 1);
				continue;
			}
			else {
				ids[name] = item._id.toString();
				desc[name] = item.description;
			}

			uniqueValues.add(name);
			counts[name] = item.count || 1;
		}
		catch (error) {
			console.error(error);
		}
	}

	const options = [];
	if (allowNone) {
		options.push(
			new StringSelectMenuOptionBuilder()
				.setLabel('None')
				.setDescription('Unequips your current item.')
				.setValue('none'),
		);
	}
	// check if uniqueValues is empty
	if (uniqueValues.size !== 0) {
		for (const name of uniqueValues) {
			const count = counts[name];
			const value = ids[name];
			const description = desc[name];

			if (count <= 0) continue;
			options.push(
				new StringSelectMenuOptionBuilder()
					.setLabel(name)
					.setDescription(`x${count} | ${description}`)
					.setValue(value),
			);
		}
	}
	return options;
};

const checkItemRequirements = async (item, userData) => {
	const requirements = item.requirements;
	if (requirements.level && await userData.getLevel() < requirements.level) {
		return false;
	}

	return true;
}

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('equip')
		.setDescription('Equip an item from your inventory!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction, analyticsObject, user = null) {
		if (user === null) user = interaction.user;

		// Buttons
		const cancel = new ButtonBuilder()
			.setCustomId('equip-cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const equipRod = new ButtonBuilder()
			.setCustomId('equip-rod')
			.setLabel('Fishing Rod')
			.setStyle(ButtonStyle.Primary);

		const equipBait = new ButtonBuilder()
			.setCustomId('equip-bait')
			.setLabel('Bait')
			.setStyle(ButtonStyle.Primary);

		const equipBooster = new ButtonBuilder()
			.setCustomId('equip-booster')
			.setLabel('Booster')
			.setStyle(ButtonStyle.Primary);

		const buttonRow = new ActionRowBuilder()
			.addComponents(cancel, equipRod, equipBait, equipBooster);

		// const buttonResponse = await interaction.reply({
		// 	embeds: [
		// 		new EmbedBuilder()
		// 			.setTitle('Equipment')
		// 			.setDescription('Choose an item type to equip!'),
		// 	],
		// 	fetchReply: true,
		// 	components: [buttonRow],
		// });
		const buttonEmbed = new EmbedBuilder()
			.setTitle('Equipment')
			.setDescription('Choose an item type to equip!');

		const buttonResponse = await new ExpandableMessage(analyticsObject, interaction)
			.setSendType(ExpandableMessage.SendType.REPLY)
			.addEmbed(buttonEmbed)
			.addComponents([buttonRow])
			.send();

		const collectorFilter = i => {
			return i.user.id === user.id;
		};

		try {
			const choice = await buttonResponse.awaitMessageComponent({ filter: collectorFilter, time: 90_000 });
			const userData = new User(await User.get(user.id));

			if (process.env.ANALYTICS || config.client.analytics) {
				await Interaction.generateCommandObject(choice, analyticsObject);
			}

			if (choice.customId === 'equip-rod') {
				let options = [];
				options = await Promise.all(await selectionOptions('rods', userData, false));
				options = options.filter((option) => option !== undefined);

				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('failed');
					await analyticsObject.setStatusMessage('No fishing rods found.');
				}

				if (options.length === 0) {
					const embed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription('You do not have any fishing rods to equip!');
					return await new ExpandableMessage(analyticsObject, choice)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(embed)
						.clearComponents()
						.send();

					// return await choice.update({
					// 	embeds: [
					// 		new EmbedBuilder()
					// 			.setTitle('Equipment')
					// 			.setDescription('You do not have any fishing rods to equip!'),
					// 	],
					// 	components: [],
					// });
				}

				const select = new StringSelectMenuBuilder()
					.setCustomId('select-rod')
					.setPlaceholder('Make a selection!')
					.addOptions(options);

				const row = new ActionRowBuilder()
					.addComponents(select);

				// const response = await choice.update({
				// 	embeds: [
				// 		new EmbedBuilder()
				// 			.setTitle('Equipment')
				// 			.setDescription('Choose your fishing rod!'),
				// 	],
				// 	components: [row],
				// });

				const embed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription('Choose your fishing rod!');
				const response = await new ExpandableMessage(analyticsObject, choice)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(embed)
						.addComponents([row])
						.send();

				const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 90_000 });
				const rodChoice = selection.values[0];
				const item = await ItemData.findById(rodChoice);
				if (!await checkItemRequirements(item, userData)) {
					if (process.env.ANALYTICS || config.client.analytics) {
						await analyticsObject.setStatus('failed');
						await analyticsObject.setStatusMessage('Requirements not met.');
					}
					// return await selection.update({
					// 	embeds: [
					// 		new EmbedBuilder()
					// 			.setTitle('Equipment')
					// 			.setDescription('You do not meet the requirements to equip this item.')
					// 			.addFields([
					// 				{ name: 'Requirements', value: item.requirements.toString() },
					// 			]),
					// 	],
					// 	components: [],
					// });

					const embed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription('You do not meet the requirements to equip this item.')
						.addFields([
							{ name: 'Requirements', value: item.requirements.toString() },
						]);
					return await new ExpandableMessage(analyticsObject, selection)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(embed)
						.clearComponents()
						.send();
				}

				const newRod = await userData.setEquippedRod(rodChoice);

				if (newRod === null) {
					if (process.env.ANALYTICS || config.client.analytics) {
						await analyticsObject.setStatus('completed');
						await analyticsObject.setStatusMessage('Unequipped fishing rod.');
					}
					// return await selection.update({
					// 	embeds: [
					// 		new EmbedBuilder()
					// 			.setTitle('Equipment')
					// 			.setDescription('Unequipped fishing rod.'),
					// 	],
					// 	components: [],
					// });

					const embed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription('Unequipped fishing rod.');
					return await new ExpandableMessage(analyticsObject, selection)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(embed)
						.clearComponents()
						.send();
				}
				else {
					if (process.env.ANALYTICS || config.client.analytics) {
						await analyticsObject.setStatus('completed');
						await analyticsObject.setStatusMessage('Equipped fishing rod.');
					}
					// await selection.update({
					// 	components: [],
					// 	embeds: [
					// 		new EmbedBuilder()
					// 			.setTitle('Equipment')
					// 			.setDescription(`Equipped fishing rod: **${newRod.name}**`),
					// 	],
					// });
					const embed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription(`Equipped fishing rod: **${newRod.name}**`);
					await new ExpandableMessage(analyticsObject, selection)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(embed)
						.clearComponents()
						.send();
				}
			}
			else if (choice.customId === 'equip-bait') {
				let options = [];
				options = await Promise.all(await selectionOptions('baits', userData));
				options = options.filter((option) => option !== undefined);

				if (options.length === 1) {
					if (process.env.ANALYTICS || config.client.analytics) {
						await analyticsObject.setStatus('failed');
						await analyticsObject.setStatusMessage('No bait found.');
					}
					// return await choice.update({
					// 	embeds: [
					// 		new EmbedBuilder()
					// 			.setTitle('Equipment')
					// 			.setDescription('You do not have any bait to equip!'),
					// 	],
					// 	components: [],
					// });

					const embed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription('You do not have any bait to equip!');
					return await new ExpandableMessage(analyticsObject, choice)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(embed)
						.clearComponents()
						.send();
				}

				const select = new StringSelectMenuBuilder()
					.setCustomId('select-bait')
					.setPlaceholder('Make a selection!')
					.addOptions(options);

				const row = new ActionRowBuilder()
					.addComponents(select);

				// const response = await choice.update({
				// 	embeds: [
				// 		new EmbedBuilder()
				// 			.setTitle('Equipment')
				// 			.setDescription('Choose your bait!'),
				// 	],
				// 	components: [row],
				// });

				const embed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription('Choose your bait!');
				const response = await new ExpandableMessage(analyticsObject, choice)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(embed)
						.addComponents([row])
						.send();

				const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 90_000 });
				const chosenBait = selection.values[0];

				if (process.env.ANALYTICS || config.client.analytics) {
					await Interaction.generateCommandObject(selection, analyticsObject);
				}

				if (chosenBait !== 'none') {
					const item = await ItemData.findById(chosenBait);
					if (!await checkItemRequirements(item, userData)) {
						if (process.env.ANALYTICS || config.client.analytics) {
							await analyticsObject.setStatus('failed');
							await analyticsObject.setStatusMessage('Requirements not met.');
						}
						// return await selection.update({
						// 	embeds: [
						// 		new EmbedBuilder()
						// 			.setTitle('Equipment')
						// 			.setDescription('You do not meet the requirements to equip this item.'),
						// 	],
						// 	components: [],
						// });
						const embed = new EmbedBuilder()
							.setTitle('Equipment')
							.setDescription('You do not meet the requirements to equip this item.');
						return await new ExpandableMessage(analyticsObject, selection)
							.setSendType(ExpandableMessage.SendType.UPDATE)
							.addEmbed(embed)
							.clearComponents()
							.send();
					}
				}

				let newBait = {};
				let description = '';
				if (chosenBait === 'none') {
					newBait = await userData.setEquippedBait(null);
					description = 'Unequipped bait.';
				}
				else {
					newBait = await userData.setEquippedBait(chosenBait);
					description = `Equipped bait: **${newBait.name}**`;
				}

				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('completed');
					await analyticsObject.setStatusMessage('Equipped bait.');
				}

				// await selection.update({
				// 	embeds: [
				// 		new EmbedBuilder()
				// 			.setTitle('Equipment')
				// 			.setDescription(description),
				// 	],
				// 	components: [],
				// });
				const updateEmbed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription(description);
				await new ExpandableMessage(analyticsObject, selection)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(updateEmbed)
						.clearComponents()
						.send();
			}
			else if (choice.customId === 'equip-booster') {
				let options = [];
				options = await Promise.all(await selectionOptions('buffs', userData, false));
				options = options.filter((option) => option !== undefined);

				if (options.length === 0) {
					if (process.env.ANALYTICS || config.client.analytics) {
						await analyticsObject.setStatus('failed');
						await analyticsObject.setStatusMessage('No boosters found.');
					}
					// return await choice.update({
					// 	embeds: [
					// 		new EmbedBuilder()
					// 			.setTitle('Equipment')
					// 			.setDescription('You do not have any boosters to equip!'),
					// 	],
					// 	components: [],
					// });

					const embed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription('You do not have any boosters to equip!');
					return await new ExpandableMessage(analyticsObject, choice)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(embed)
						.clearComponents()
						.send();
				}

				const select = new StringSelectMenuBuilder()
					.setCustomId('select-booster')
					.setPlaceholder('Make a selection!')
					.addOptions(options);

				const row = new ActionRowBuilder()
					.addComponents(select);

				// const response = await choice.update({
				// 	embeds: [
				// 		new EmbedBuilder()
				// 			.setTitle('Equipment')
				// 			.setDescription('Choose your booster!'),
				// 	],
				// 	components: [row],
				// });

				const embed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription('Choose your booster!');
				const response = await new ExpandableMessage(analyticsObject, choice)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(embed)
						.addComponents([row])
						.send();

				const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 90_000 });
				const chosenBooster = selection.values[0];

				if (process.env.ANALYTICS || config.client.analytics) {
					await Interaction.generateCommandObject(selection, analyticsObject);
				}

				let newBooster = {};
				let description = '';
				newBooster = await userData.startBooster(chosenBooster);
				description = `Equipped booster: **${newBooster.name}**`;

				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('completed');
					await analyticsObject.setStatusMessage('Equipped booster.');
				}

				// await selection.update({
				// 	embeds: [
				// 		new EmbedBuilder()
				// 			.setTitle('Equipment')
				// 			.setDescription(description),
				// 	],
				// 	components: [],
				// });

				const updateEmbed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription(description);
				await new ExpandableMessage(analyticsObject, selection)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(updateEmbed)
						.clearComponents()
						.send();
			}
			else if (choice.customId === 'equip-cancel') {
				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('completed');
					await analyticsObject.setStatusMessage('Cancelled equip.');
				}
				// await choice.update({
				// 	embeds: [
				// 		new EmbedBuilder()
				// 			.setTitle('Equipment')
				// 			.setDescription('Equip has been cancelled.'),
				// 	],
				// 	components: [],
				// });

				const embed = new EmbedBuilder()
						.setTitle('Equipment')
						.setDescription('Equip has been cancelled.');
				await new ExpandableMessage(analyticsObject, choice)
						.setSendType(ExpandableMessage.SendType.UPDATE)
						.addEmbed(embed)
						.clearComponents()
						.send();
			}
		}
		catch (e) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage(e);
			}

			// await interaction.editReply({
			// 	embeds: [
			// 		new EmbedBuilder()
			// 			.setTitle('Timed Out')
			// 			.setDescription('Response not received within 1 minute, cancelling.'),
			// 	],
			// 	components: [],
			// });

			const embed = new EmbedBuilder()
				.setTitle('Timed Out')
				.setDescription('Response not received within 1 minute, cancelling.');
			await new ExpandableMessage(analyticsObject, interaction)
				.setSendType(ExpandableMessage.SendType.EDIT)
				.addEmbed(embed)
				.clearComponents()
				.send();
		}
	},
};
