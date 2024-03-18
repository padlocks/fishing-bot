const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getUser, setEquippedRod, setEquippedBait } = require('../../../util/User');
const { ItemData } = require('../../../schemas/ItemSchema');

const selectionOptions = async (inventoryPath, userData) => {
	const uniqueValues = new Set();

	return userData.inventory[inventoryPath].map(async (objectId) => {
		let count = 1;
		try {
			const item = await ItemData.findById(objectId.valueOf());
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
					.setDescription(`x${count} | ${item.description}`)
					.setEmoji(item.icon.data.split(':')[1])
					.setValue(value);
			}
			else {
				count += item.count || 1;
			}

		}
		catch (error) {
			console.error(error);
		}
	});
};

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('equip')
		.setDescription('Equip an item from your inventory!'),
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
			const choice = await buttonResponse.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
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

				const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
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
				options = await selectionOptions('baits', userData);
				options = options.filter((option) => option !== undefined);

				if (options.length === 0) {
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

				const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
				const baitChoice = selection.values[0];
				const newBait = await setEquippedBait(user.id, baitChoice);

				await choice.update({
					embeds: [
						new EmbedBuilder()
							.setTitle('Equipment')
							.setDescription(`Equipped bait: **${newBait.name}**`),
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
