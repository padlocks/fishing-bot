const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { selectionOptions, getCollectionFilter } = require('../../util/Utils');
const { xpToLevel, getUser, sendToInventory } = require('../../util/User');
const { Item } = require('../../schemas/ItemSchema');

module.exports = {
	customId: 'buy-other',
	run: async (client, interaction) => {
		const user = interaction.user;

		try {
			const options = await getSelectionOptions();

			if (options.length === 0) {
				return await interaction.reply({
					content: 'There is nothing for you to buy!',
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

const getSelectionOptions = async () => {
	let options = await Promise.all([
		...(await selectionOptions('item')),
		...(await selectionOptions('gacha')),
		...(await selectionOptions('buff')),
		...(await selectionOptions('license')),
	]);
	options = options.filter((option) => option !== undefined);
	return options;
};

const createSelectMenu = async (options) => {
	return new StringSelectMenuBuilder()
		.setCustomId('select-item')
		.setPlaceholder('Make a selection!')
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
	// return await response.awaitMessageComponent({ filter: getCollectionFilter(['select-item'], userId), time: 30000 });
	const collector = response.createMessageComponentCollector({ filter: getCollectionFilter(['select-item'], userId), time: 30000 });

	collector.on('collect', async i => {
		const userData = await getUser(userId);
		return await processItemSelection(i, userData);
	});
};

const processItemSelection = async (selection, userData) => {
	const itemChoice = selection.values[0];
	const originalItem = await getItemById(itemChoice);

	const canBuy = await checkItemRequirements(originalItem, userData);

	if (userData.inventory.money < originalItem.price && canBuy) {
		return await selection.reply({
			content: 'You do not have enough money to buy this item!',
			ephemeral: true,
			components: [],
		});
	}
	else if (canBuy) {
		userData.inventory.money -= originalItem.price;
		await sendToInventory(userData.userId, originalItem);

		userData.save();
		await selection.reply({
			components: [],
			content: `You have successfully bought a ${originalItem.name}!`,
			ephemeral: true,
		});
	}
	else {
		let content = 'You do not meet the requirements to buy this item!\n';
		if (originalItem.toJSON().requirements.level) {
			content += `- You need to be at least level ${originalItem.toJSON().requirements.level || 0}.\n`;
		}
		if (originalItem.prerequisites) {
			content += `- You need to have the following item(s): ${originalItem.prerequisites.join(', ')}.\n`;
		}
		await selection.reply({
			content: content,
			ephemeral: true,
			components: [],
		});
	}
};

const getItemById = async (itemId) => {
	return await Item.findById(itemId);
};

const checkItemRequirements = async (item, userData) => {
	item = item.toJSON();
	const userLevel = await xpToLevel(userData.xp);
	const meetsLevelRequirement = userLevel >= (item.requirements?.level || 0);
	const meetsPrerequisites = item.prerequisites?.every((prereq) => userData.inventory.items.some((i) => i.name === prereq));
	return meetsLevelRequirement && meetsPrerequisites;
};
