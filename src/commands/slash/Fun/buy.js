const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Item } = require('../../../schemas/ItemSchema');
const { getUser, xpToLevel } = require('../../../util/User');
const { clone } = require('../../../util/Utils');

const selectionOptions = async (type) => {
	const shopItems = await Item.find({ shopItem: true, type: type });
	const uniqueValues = new Set();

	return shopItems.map(async (objectId) => {
		try {
			const item = await Item.findById(objectId.valueOf());
			const name = item.name;
			const value = item._id.toString();

			if (item.state && item.state === 'destroyed') {
				return;
			}

			// Check if the value is unique
			if (!uniqueValues.has(name)) {
				uniqueValues.add(name);

				return new StringSelectMenuOptionBuilder()
					.setLabel(item.name)
					.setDescription(`$${item.price} | ${item.description}`)
					.setEmoji(item.toJSON().icon.data.split(':')[1])
					.setValue(value);
			}
		}
		catch (error) {
			console.error(error);
		}
	});
};

const handleBuyRod = async (choice, user, userData, collectorFilter) => {
	let options = [];
	options = await Promise.all(await selectionOptions('rod'));
	options = options.filter((option) => option !== undefined);

	if (options.length === 0) {
		return await choice.update({
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription('There are no fishing rods for you to buy!'),
			],
			components: [],
		});
	}

	const select = new StringSelectMenuBuilder()
		.setCustomId('select-rod')
		.setPlaceholder('Make a selection!')
		.addOptions(options);

	const row = new ActionRowBuilder()
		.addComponents(select);

	const response = await choice.update({
		embeds: [
			new EmbedBuilder()
				.setTitle('Shop')
				.setDescription('Choose which fishing rod you want to buy!'),
		],
		components: [row],
	});

	const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
	const rodChoice = selection.values[0];
	const originalItem = await Item.findById(rodChoice);

	// check if user meets item requirements
	let canBuy = true;

	const userLevel = await xpToLevel(userData.xp);
	if (userLevel < originalItem.toJSON().requirements.level) {
		canBuy = false;
	}

	if (userData.inventory.money < originalItem.price && canBuy) {
		return await choice.update({
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription('You do not have enough money to buy this item!'),
			],
			components: [],
		});
	}
	else if (canBuy) {
		userData.inventory.money -= originalItem.price;
		const item = await clone(originalItem, user.id);
		userData.inventory.rods.push(item);

		userData.save();
		await selection.update({
			components: [],
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription(`Bought fishing rod: **${item.name}**`),
			],
		});
	}
	else {
		await choice.update({
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription(`You need to be level ${originalItem.requirements.level} to buy this item!`),
			],
			components: [],
		});
	}
};

const handleBuyBait = async (choice, user, userData, collectorFilter) => {
	let options = [];
	options = await Promise.all(await selectionOptions('bait'));
	options = options.filter((option) => option !== undefined);

	if (options.length === 0) {
		return await choice.update({
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription('There is no bait for you to buy!'),
			],
			components: [],
		});
	}

	const select = new StringSelectMenuBuilder()
		.setCustomId('select-bait')
		.setPlaceholder('Make a selection!')
		.addOptions(options);

	const row = new ActionRowBuilder()
		.addComponents(select);

	const response = await choice.update({
		embeds: [
			new EmbedBuilder()
				.setTitle('Shop')
				.setDescription('Choose which kind of bait you want to buy!'),
		],
		components: [row],
	});

	const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
	const baitChoice = selection.values[0];
	const originalItem = await Item.findById(baitChoice);

	// check if user meets item requirements
	const userLevel = await xpToLevel(userData.xp);
	if (userLevel < originalItem.toJSON().requirements.level) {
		return await selection.update({
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription(`You need to be level ${originalItem.requirements.level} to buy this item!`),
			],
			components: [],
		});
	}

	const amount1 = new ButtonBuilder()
		.setCustomId('buy-one')
		.setLabel('Buy 1')
		.setStyle(ButtonStyle.Primary);

	const amount5 = new ButtonBuilder()
		.setCustomId('buy-five')
		.setLabel('Buy 5')
		.setStyle(ButtonStyle.Primary);

	const amount10 = new ButtonBuilder()
		.setCustomId('buy-ten')
		.setLabel('Buy 10')
		.setStyle(ButtonStyle.Primary);

	const amountRow = new ActionRowBuilder()
		.addComponents(amount1, amount5, amount10);

	const amountResponse = await selection.update({
		embeds: [
			new EmbedBuilder()
				.setTitle('Shop')
				.setDescription(`Choose how many of **${originalItem.name}** you want to buy!`),
		],
		components: [amountRow],
	});

	const amountSelection = await amountResponse.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
	const amountChoice = amountSelection.customId;

	let amount;
	if (amountChoice === 'buy-one') {
		amount = 1;
	}
	else if (amountChoice === 'buy-five') {
		amount = 5;
	}
	else if (amountChoice === 'buy-ten') {
		amount = 10;
	}

	if (userData.inventory.money < (originalItem.price * amount)) {
		return await amountSelection.update({
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription('You do not have enough money to buy this item!'),
			],
			components: [],
		});
	}
	else {
		userData.inventory.money -= originalItem.price * amount;
		const item = await clone(originalItem, user.id);
		item.count = amount;
		userData.inventory.baits.push(item);

		userData.save();
		await amountSelection.update({
			components: [],
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription(`Bought bait: **${item.name}** x${amount} for $${item.price * amount}!`),
			],
		});
	}
};

const handleBuyItem = async (choice, user, userData, collectorFilter) => {
	let options = [];
	options = await Promise.all(await selectionOptions('item'));
	options = options.filter((option) => option !== undefined);

	if (options.length === 0) {
		return await choice.update({
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription('There is nothing for you to buy!'),
			],
			components: [],
		});
	}

	const select = new StringSelectMenuBuilder()
		.setCustomId('select-item')
		.setPlaceholder('Make a selection!')
		.addOptions(options);

	const row = new ActionRowBuilder()
		.addComponents(select);

	const response = await choice.update({
		embeds: [
			new EmbedBuilder()
				.setTitle('Shop')
				.setDescription('Choose something to buy!'),
		],
		components: [row],
	});

	const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
	const itemChoice = selection.values[0];
	const originalItem = await Item.findById(itemChoice);

	// check if user meets item requirements
	let canBuy = true;

	const userLevel = await xpToLevel(userData.xp);
	if (userLevel < originalItem.toJSON().requirements.level || 0) {
		canBuy = false;
	}

	if (userData.inventory.money < originalItem.price && canBuy) {
		return await choice.update({
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription('You do not have enough money to buy this item!'),
			],
			components: [],
		});
	}
	else if (canBuy) {
		userData.inventory.money -= originalItem.price;
		const item = await clone(originalItem, user.id);
		userData.inventory.items.push(item);

		userData.save();
		await selection.update({
			components: [],
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription(`Bought item: **${item.name}**`),
			],
		});
	}
	else {
		await choice.update({
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription(`You need to be level ${originalItem.requirements.level} to buy this item!`),
			],
			components: [],
		});
	}
};

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy from the shop!'),
	options: {
		cooldown: 15000,
	},
	/**
	 * @param {ExtendedClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async run(client, interaction, user = null) {
		if (user === null) user = interaction.user;

		// Buttons
		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const buyRod = new ButtonBuilder()
			.setCustomId('buy-rod')
			.setLabel('Fishing Rod')
			.setStyle(ButtonStyle.Primary);

		const buyBait = new ButtonBuilder()
			.setCustomId('buy-bait')
			.setLabel('Bait')
			.setStyle(ButtonStyle.Primary);

		const buyOther = new ButtonBuilder()
			.setCustomId('buy-other')
			.setLabel('Other')
			.setStyle(ButtonStyle.Primary);

		const buttonRow = new ActionRowBuilder()
			.addComponents(cancel, buyRod, buyBait, buyOther);

		const buttonResponse = await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Shop')
					.setDescription('Choose an item type to buy!'),
			],
			fetchReply: true,
			components: [buttonRow],
		});

		const collectorFilter = i => {
			return i.user.id === user.id;
		};

		try {
			const choice = await buttonResponse.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
			const userData = await getUser(user.id);

			if (choice.customId === 'buy-rod') {
				await handleBuyRod(choice, user, userData, collectorFilter);
			}
			else if (choice.customId === 'buy-bait') {
				await handleBuyBait(choice, user, userData, collectorFilter);
			}
			else if (choice.customId === 'buy-item') {
				await handleBuyItem(choice, user, userData, collectorFilter);
			}
			else if (choice.customId === 'cancel') {
				await choice.update({
					embeds: [
						new EmbedBuilder()
							.setTitle('Shop')
							.setDescription('Shopping has been cancelled.'),
					],
					components: [],
				});
			}
		}
		catch (e) {
			console.error(e);
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Timed Out')
						.setDescription('Response not received within 1 minute, cancelling.'),
				],
				components: [],
			});
		}
	},
};
