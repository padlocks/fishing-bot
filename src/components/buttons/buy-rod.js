const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { selectionOptions, getCollectionFilter } = require('../../util/Utils');
const { Item } = require('../../schemas/ItemSchema');
const { User, getUser } = require('../../class/User');

module.exports = {
	customId: 'buy-rod',
	run: async (client, interaction) => {
		const user = interaction.user;

		try {
			const options = await getRodOptions();

			if (options.length === 0) {
				return await interaction.reply({
					content: 'There is no fishing rod for you to buy!',
					ephemeral: true,
					components: [],
				});
			}

			const select = await createSelectMenu(options);
			const row = await createActionRow(select);

			const components = await removeAdditionalActionRows(2, interaction.message.components);

			const response = await updateInteraction(interaction, row, components);

			await getSelection(response, user.id);
		}
		catch (err) {
			// console.error(err);
		}
	},
};

const getRodOptions = async () => {
	let options = await Promise.all(await selectionOptions('rod'));
	options = options.filter((option) => option !== undefined);
	return options;
};

const createSelectMenu = async (options) => {
	return new StringSelectMenuBuilder()
		.setCustomId('select-rod')
		.setPlaceholder('Select a fishing rod to buy...')
		.addOptions(options);
};

const createActionRow = async (select) => {
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

const updateInteraction = async (interaction, row, components) => {
	return await interaction.update({
		embeds: interaction.message.embeds,
		components: [...components, row],
	});
};

const getSelection = async (response, userId) => {
	// return await response.awaitMessageComponent({ filter: getCollectionFilter(['select-rod'], userId), time: 30_000 });
	const collector = response.createMessageComponentCollector({ filter: getCollectionFilter(['select-rod'], userId), time: 30000 });

	collector.on('collect', async i => {
		const userData = new User(await getUser(userId));
		return await processRodSelection(i, userData);
	});
};

const processRodSelection = async (selection, userData) => {
	const rodChoice = selection.values[0];
	const originalItem = await getItemById(rodChoice);

	const canBuy = await checkItemRequirements(originalItem, userData);

	if (await userData.getMoney() < originalItem.price && canBuy) {
		return await selection.reply({
			content: 'You do not have enough money to buy this item!',
			ephemeral: true,
			components: [],
		});
	}
	else if (canBuy) {
		await buyItem(originalItem, userData);
		await selection.reply({
			components: [],
			content: `You have successfully bought a ${originalItem.name}!`,
			ephemeral: true,
		});
	}
	else {
		await selection.reply({
			content: `You need to be level ${originalItem.requirements.level} to buy this item!`,
			ephemeral: true,
			components: [],
		});
	}
};

const getItemById = async (itemId) => {
	return await Item.findById(itemId);
};

const checkItemRequirements = async (item, userData) => {
	const userLevel = await userData.getLevel();
	return userLevel >= item.toJSON().requirements.level;
};

const buyItem = async (item, userData) => {
	await userData.addMoney(-item.price);
	await userData.sendToInventory(item);
};
