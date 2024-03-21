const { ActionRowBuilder, StringSelectMenuBuilder, ButtonStyle, ButtonBuilder, ComponentType } = require('discord.js');
const { clone, selectionOptions, getCollectionFilter } = require('../../util/Utils');
const { xpToLevel, getUser, getAllBaits } = require('../../util/User');
const { Item, ItemData } = require('../../schemas/ItemSchema');

module.exports = {
	customId: 'buy-bait',
	run: async (client, interaction) => {
		const user = interaction.user;

		try {
			const options = await getBaitOptions();

			if (options.length === 0) {
				return await interaction.reply({
					content: 'There is no bait for you to buy!',
					ephemeral: true,
					components: [],
				});
			}

			const select = createBaitSelectMenu(options);
			const row = createBaitActionRow(select);

			const components = await removeAdditionalActionRows(2, interaction.message.components);

			const response = await interaction.update({
				embeds: interaction.message.embeds,
				components: [...components, row],
			});

			await getBaitSelection(response, user.id);

		}
		catch (err) {
			// console.error(err);
		}
	},
};

const getBaitOptions = async () => {
	let options = await Promise.all(await selectionOptions('bait'));
	options = options.filter((option) => option !== undefined);
	return options;
};

const createBaitSelectMenu = (options) => {
	return new StringSelectMenuBuilder()
		.setCustomId('select-bait')
		.setPlaceholder('Select a kind of bait to buy...')
		.addOptions(options);
};

const createBaitActionRow = (select) => {
	return new ActionRowBuilder().addComponents(select);
};

const removeAdditionalActionRows = (num, components) => {
	const savedRows = [];
	for (let i = 0; i < num; i++) {
		const row = components.find((r) => r.type === ComponentType.ActionRow);
		savedRows.push(row);
		components.splice(components.indexOf(row), 1);
	}

	components.length = 0;

	for (let i = 0; i < savedRows.length; i++) {
		components.push(savedRows[i]);
	}

	return components;
};

const getBaitSelection = async (response, user) => {
	// return await response.awaitMessageComponent({ filter: getCollectionFilter(['select-bait'], userId), time: 30000 });
	const collector = response.createMessageComponentCollector({ filter: getCollectionFilter(['select-bait'], user), time: 30000 });

	collector.on('collect', async i => {
		const userData = await getUser(user);
		return await processBaitSelection(i, userData, user);
	});
};

const processBaitSelection = async (selection, userData, user) => {
	const baitChoice = selection.values[0];
	const originalItem = await getItemById(baitChoice);

	if (!meetsItemRequirements(userData, originalItem)) {
		return await selection.reply({
			content: `You need to be level ${originalItem.toJSON().requirements.level} to buy this item!`,
			ephemeral: true,
			components: [],
		});
	}

	const amountRow = createAmountActionRow();
	const components = removeAdditionalActionRows(3, selection.message.components);

	const amountResponse = await selection.update({
		embeds: selection.message.embeds,
		components: [...components, amountRow],
	});

	const amountSelection = await amountResponse.awaitMessageComponent({ filter: getCollectionFilter(['buy-one', 'buy-five', 'buy-ten'], user), time: 30000 });
	const amountChoice = amountSelection.customId;
	const amount = await getAmountFromChoice(amountChoice);

	if (!hasEnoughMoney(userData, originalItem, amount)) {
		return await amountSelection.reply({
			content: 'You do not have enough money to buy this item!',
			ephemeral: true,
			components: [],
		});
	}
	else {
		await buyItem(userData, originalItem, amount);
		await amountSelection.reply({
			components: [],
			content: `You have successfully bought ${amount} ${originalItem.name}!`,
			ephemeral: true,
		});
	}
};

const getItemById = async (itemId) => {
	return await Item.findById(itemId);
};

const meetsItemRequirements = async (userData, item) => {
	const userLevel = await xpToLevel(userData.xp);
	return userLevel >= item.toJSON().requirements.level;
};

const createAmountActionRow = () => {
	const amount1 = new ButtonBuilder().setCustomId('buy-one').setLabel('Buy 1').setStyle(ButtonStyle.Primary);
	const amount5 = new ButtonBuilder().setCustomId('buy-five').setLabel('Buy 5').setStyle(ButtonStyle.Primary);
	const amount10 = new ButtonBuilder().setCustomId('buy-ten').setLabel('Buy 10').setStyle(ButtonStyle.Primary);
	return new ActionRowBuilder().addComponents(amount1, amount5, amount10);
};


const getAmountFromChoice = async (amountChoice) => {
	if (amountChoice === 'buy-one') {
		return 1;
	}
	else if (amountChoice === 'buy-five') {
		return 5;
	}
	else if (amountChoice === 'buy-ten') {
		return 10;
	}
};

const hasEnoughMoney = (userData, item, amount) => {
	return userData.inventory.money >= item.price * amount;
};

const buyItem = async (userData, item, amount) => {
	userData.inventory.money -= item.price * amount;
	let baitItem;
	const baits = await getAllBaits(userData.userId);
	const itemId = baits.find((bait) => bait.name === item.name);
	if (itemId) {
		baitItem = await ItemData.findById(itemId) || {};
		baitItem.count += amount;
		await baitItem.save();
	}
	else {
		baitItem = await clone(item, userData.userId);
		baitItem.count = amount;
		userData.inventory.baits.push(baitItem);
		await baitItem.save();
		await userData.save();
	}
};