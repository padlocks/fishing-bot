const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getUser, setEquippedRod, setEquippedBait } = require('../../../util/User');
const { ItemData } = require('../../../schemas/ItemSchema');

const selectionOptions = async (inventoryPath, userData) => {
	const uniqueValues = new Set();
	const counts = {};
	const ids = {};
	const desc = {};

	// Loop through inventory items
	for (const objectId of userData.inventory[inventoryPath]) {
		try {
			const item = await ItemData.findById(objectId.valueOf());
			const name = item.name;

			if (item.state && item.state === 'destroyed') {
				continue;
			}

			if (uniqueValues.has(name)) {
				counts[name] = (counts[name] || 1) + (item.count || 1);
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
	options.push(
		new StringSelectMenuOptionBuilder()
			.setLabel('None')
			.setDescription('Unequips your current item.')
			.setValue('none'),
	);
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
	async run(client, interaction, user = null) {
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

		const buttonRow = new ActionRowBuilder()
			.addComponents(cancel, equipRod, equipBait);

		const buttonResponse = await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Equipment')
					.setDescription('Choose an item type to equip!'),
			],
			fetchReply: true,
			components: [buttonRow],
		});

		const collectorFilter = i => {
			return i.user.id === user.id;
		};

		try {
			const choice = await buttonResponse.awaitMessageComponent({ filter: collectorFilter, time: 30_000 });
			const userData = await getUser(user.id);

			if (choice.customId === 'equip-rod') {
				let options = [];
				options = await Promise.all(await selectionOptions('rods', userData));
				options = options.filter((option) => option !== undefined);

				if (options.length === 0) {
					return await choice.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('Equipment')
								.setDescription('You do not have any fishing rods to equip!'),
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
							.setTitle('Equipment')
							.setDescription('Choose your fishing rod!'),
					],
					components: [row],
				});

				const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 30_000 });
				const rodChoice = selection.values[0];
				const newRod = await setEquippedRod(user.id, rodChoice);

				await selection.update({
					components: [],
					embeds: [
						new EmbedBuilder()
							.setTitle('Equipment')
							.setDescription(`Equipped fishing rod: **${newRod.name}**`),
					],
				});
			}
			else if (choice.customId === 'equip-bait') {
				let options = [];
				options = await Promise.all(await selectionOptions('baits', userData));
				options = options.filter((option) => option !== undefined);

				if (options.length === 1) {
					return await choice.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('Equipment')
								.setDescription('You do not have any bait to equip!'),
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
							.setTitle('Equipment')
							.setDescription('Choose your bait!'),
					],
					components: [row],
				});

				const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 30_000 });
				const chosenBait = selection.values[0];

				let newBait = {};
				let description = '';
				if (chosenBait === 'none') {
					newBait = await setEquippedBait(user.id, null);
					description = 'Unequipped bait.';
				}
				else {
					newBait = await setEquippedBait(user.id, chosenBait);
					description = `Equipped bait: **${newBait.name}**`;
				}

				await selection.update({
					embeds: [
						new EmbedBuilder()
							.setTitle('Equipment')
							.setDescription(description),
					],
					components: [],
				});
			}
			else if (choice.customId === 'cancel') {
				await choice.update({
					embeds: [
						new EmbedBuilder()
							.setTitle('Equipment')
							.setDescription('Equip has been cancelled.'),
					],
					components: [],
				});
			}
		}
		catch (e) {
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
