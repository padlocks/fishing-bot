const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const { User } = require('../../../class/User');
const config = require('../../../config');
const { ItemData } = require('../../../schemas/ItemSchema');

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
				.setDescription('You do not have any crates.')
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
					.setValue(name),
			);
		}
	}
	return options;
};

const createButtonRow = () => {
	const buttons = [
		{ id: 'open-one', label: 'Open 1' },
		{ id: 'open-five', label: 'Open 5' },
		{ id: 'open-ten', label: 'Open 10' },
		{ id: 'open-hundred', label: 'Open 100' },
	].map(({ id, label }) =>
		new ButtonBuilder()
			.setCustomId(id)
			.setLabel(label)
			.setStyle(ButtonStyle.Primary)
	);

	return new ActionRowBuilder().addComponents(buttons);
};

const handleOpenBox = async (client, interaction, analyticsObject, user, selectedBox, quantity) => {
	const opened = await user.openBox(selectedBox, quantity);
	if (opened.length === 0) {
		await interaction.editReply({ content: 'Opening failed. You may not have enough boxes.', components: [] });
		return;
	}

	// Remove duplicates from array opened and count them together as one element
	const uniqueOpened = [];
	opened.forEach((item) => {
		const index = uniqueOpened.findIndex((uniqueItem) => uniqueItem.item.name === item.item.name);
		if (index === -1) {
			uniqueOpened.push({ item: item.item, count: item.count });
		}
		else {
			uniqueOpened[index].count += item.count;
		}
	});

	const embed = new EmbedBuilder()
		.setTitle(`Opened ${quantity} ${selectedBox}`)
		.setDescription(uniqueOpened.map((item) => `<${item.item.icon?.animated ? 'a' : ''}:${item.item.icon?.data}> ${item.count}x ${item.item.name}`).join('\n'))
		.setColor('Green');

	const userInventory = await user.getInventory();
	const boxes = userInventory.gacha.filter(async (itemId) => {
		// Search up itemId in database
		const item = await ItemData.findById(itemId);
		return item.name === selectedBox;
	});

	const box = await ItemData.findById(boxes[0]);

	if (box.count >= quantity) {
		const openAgainButton = new ButtonBuilder()
			.setCustomId(`open-again:${selectedBox}:${quantity}`)
			.setLabel('Open Again')
			.setStyle(ButtonStyle.Secondary);

		const openAgainRow = new ActionRowBuilder().addComponents(openAgainButton);

		const openAgainCollector = interaction.channel.createMessageComponentCollector({
			filter: (i) => i.user.id === interaction.user.id && i.customId.includes('open-again'),
			time: 30000,
		});

		openAgainCollector.on('collect', async (buttonInteraction) => {
			openAgainCollector.stop();
			interaction.editReply({ components: [] });
			await module.exports.run(client, buttonInteraction, analyticsObject, user, selectedBox, quantity);
		});

		openAgainCollector.on('end', async (collected) => {
			if (collected.size === 0) {
				await interaction.editReply({ components: [] });
			}
		});

		await interaction.editReply({
			content: '',
			embeds: [embed],
			components: [openAgainRow],
		});
	} else {
		await interaction.editReply({
			content: 'You do not have enough boxes to open again.',
			embeds: [embed],
			components: [],
		});
	}
};

module.exports = {
	customId: 'open-again',
	structure: new SlashCommandBuilder()
		.setName('open')
		.setDescription('Opens a gacha box.'),
	/**
	 * @param {ExtendedClient} client
	 * @param {ChatInputCommandInteraction<true>} interaction
	 */
	run: async (client, interaction, analyticsObject, usr = null, selectedBox, quantity = 0) => {
		await interaction.deferReply();

		const user = usr ? usr : new User(await User.get(interaction.user.id));

		if (!selectedBox) {
			const options = await selectionOptions('gacha', user, false);
			if (options.length === 0) {
				await interaction.editReply({ content: 'You do not have any boxes to open.' });
				return;
			}

			const selectMenu = new StringSelectMenuBuilder()
				.setCustomId('select-box')
				.setPlaceholder('Select a box to open')
				.addOptions(options);

			const row = new ActionRowBuilder().addComponents(selectMenu);

			await interaction.editReply({
				content: 'Please select a box to open:',
				components: [row],
			});

			const filter = (i) => i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

			collector.on('collect', async (i) => {
				collector.stop();
				selectedBox = i.values ? i.values[0] : selectedBox;

				if (quantity === 0) {
					const buttonRow = createButtonRow();
					await i.update({
						content: `How many of ${selectedBox} would you like to open?`,
						components: [buttonRow],
					});

					const buttonCollector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

					buttonCollector.on('collect', async (buttonInteraction) => {
						quantity = { 'open-one': 1, 'open-five': 5, 'open-ten': 10, 'open-hundred': 100 }[buttonInteraction.customId];
						buttonCollector.stop();
						await handleOpenBox(client, interaction, analyticsObject, user, selectedBox, quantity);
					});

					buttonCollector.on('end', async (collected) => {
						if (collected.size === 0) {
							await interaction.editReply({ components: [] });
						}
					});
				} else {
					await handleOpenBox(client, interaction, analyticsObject, user, selectedBox, quantity);
				}
			});

			collector.on('end', async (collected) => {
				if (collected.size === 0) {
					await interaction.editReply({ components: [] });
				}
			});
		} else {
			if (quantity === 0) {
				const buttonRow = createButtonRow();
				await interaction.editReply({ components: [buttonRow] });

				const filter = (i) => i.user.id === interaction.user.id;
				const buttonCollector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

				buttonCollector.on('collect', async (buttonInteraction) => {
					quantity = { 'open-one': 1, 'open-five': 5, 'open-ten': 10, 'open-hundred': 100 }[buttonInteraction.customId];
					buttonCollector.stop();
					await handleOpenBox(client, interaction, analyticsObject, user, selectedBox, quantity);
				});

				buttonCollector.on('end', async (collected) => {
					if (collected.size === 0) {
						await interaction.editReply({ components: [] });
					}
				});
			} else {
				await handleOpenBox(client, interaction, analyticsObject, user, selectedBox, quantity);
			}
		}
	},
};
