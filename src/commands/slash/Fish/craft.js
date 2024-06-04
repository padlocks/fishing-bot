const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Events, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { User, getUser } = require('../../../class/User');
const { FishingRod } = require('../../../class/FishingRod');
const { CustomRod, CustomRodData } = require('../../../schemas/CustomRodSchema');
const { ItemData } = require('../../../schemas/ItemSchema');
const { getCollectionFilter } = require('../../../util/Utils');

const getSelectionOptions = async (parts) => {
	if (!parts) return [];

	const uniqueValues = new Set();
	let options = [];
	const partPromises = parts.map(async (part) => {
		try {
			const value = part._id.toString();

			if (!uniqueValues.has(value)) {
				uniqueValues.add(value);

				return new StringSelectMenuOptionBuilder()
					.setLabel(part.name)
					.setDescription(`${part.description}`)
					// .setEmoji(part.icon.data.split(':')[1])
					.setValue(value);
			}

		}
		catch (error) {
			console.error(error);
		}
	});

	options = await Promise.all(partPromises);
	options = options.filter((option) => option !== undefined);
	return options;
}

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('craft')
		.setDescription('Craft a new item!')
		.addStringOption(option => option.setName('name').setDescription('The name of the crafted item.').setRequired(true)),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction, user = null) {
		if (user === null) user = interaction.user;
		await interaction.deferReply();

		const name = interaction.options.getString('name');

		const userData = new User(await getUser(user.id));
		const items = await userData.getItems();
		const parts = items.filter((item) => item.type.includes('part_'));

		const rodParts = parts.filter((part) => part.type.includes('part_rod'));
		const rodOptions = await getSelectionOptions(rodParts);
		if (rodOptions.length === 0) return interaction.editReply('You do not have any rod parts!');

		const reelParts = parts.filter((part) => part.type.includes('part_reel'));
		const reelOptions = await getSelectionOptions(reelParts);
		if (reelOptions.length === 0) return interaction.editReply('You do not have any reel parts!');

		const hookParts = parts.filter((part) => part.type.includes('part_hook'));
		const hookOptions = await getSelectionOptions(hookParts);
		if (hookOptions.length === 0) return interaction.editReply('You do not have any hook parts!');

		const handleParts = parts.filter((part) => part.type.includes('part_handle'));
		const handleOptions = await getSelectionOptions(handleParts);
		if (handleOptions.length === 0) return interaction.editReply('You do not have any handle parts!');

		const rodSelect = new StringSelectMenuBuilder()
			.setCustomId('craft-select-rod')
			.setPlaceholder('Select a rod part')
			.addOptions(rodOptions);

		const reelSelect = new StringSelectMenuBuilder()
			.setCustomId('craft-select-reel')
			.setPlaceholder('Select a reel part')
			.addOptions(reelOptions);

		const hookSelect = new StringSelectMenuBuilder()
			.setCustomId('craft-select-hook')
			.setPlaceholder('Select a hook part')
			.addOptions(hookOptions);

		const handleSelect = new StringSelectMenuBuilder()
			.setCustomId('craft-select-handle')
			.setPlaceholder('Select a handle part')
			.addOptions(handleOptions);

		const submitButton = new ButtonBuilder()
			.setCustomId('craft-rod-submit')
			.setLabel('Submit')
			.setStyle(ButtonStyle.Primary);

		const cancelButton = new ButtonBuilder()
			.setCustomId('craft-rod-cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);
		
		const firstActionRow = new ActionRowBuilder().addComponents(rodSelect);
		const secondActionRow = new ActionRowBuilder().addComponents(reelSelect);
		const thirdActionRow = new ActionRowBuilder().addComponents(hookSelect);
		const fourthActionRow = new ActionRowBuilder().addComponents(handleSelect);
		const fifthActionRow = new ActionRowBuilder().addComponents(submitButton, cancelButton);

		const response = await interaction.editReply({
			embeds: [{
				title: 'Crafting',
				description: 'Select the rod piece of your choice!',
			}],
			components: [firstActionRow],
			fetchReply: true,
		});

		const selectedParts = {
			rod: {id: null, object: null},
			reel: {id: null, object: null},
			hook: {id: null, object: null},
			handle: {id: null, object: null},
		}

		const collector = response.createMessageComponentCollector({ filter: getCollectionFilter(['craft-select-rod', 'craft-select-reel', 'craft-select-hook', 'craft-select-handle', 'craft-rod-submit', 'craft-rod-cancel'], user.id), time: 30_000 });
		collector.on('collect', async i => {
			try {
				if (i.customId === 'craft-rod-cancel') {
					await i.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('Crafting')
								.setDescription('Crafting has been cancelled!'),
						],
						components: [],
					});
					return collector.stop();
				}
				else if (i.customId === 'craft-rod-submit') {
					const userData = new User(await getUser(user.id));
					const rodObject = new CustomRodData({
						name: name,
						description: `Made by ${user.username}`,
						rarity: 'Custom',
						rod: selectedParts.rod.object._id,
						reel: selectedParts.reel.object._id,
						hook: selectedParts.hook.object._id,
						handle: selectedParts.handle.object._id,
						type: 'customrod',
					});
					const rod = new FishingRod(rodObject);
					await rod.generateStats();
					await userData.removeItems([selectedParts.rod.id, selectedParts.reel.id, selectedParts.hook.id, selectedParts.handle.id]);
					await userData.addCustomRodToInventory(await rod.getId());

					await i.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('Crafting')
								.setDescription('Crafting has been completed!'),
						],
						components: [],
					});
					return collector.stop();
				}
				else if (i.customId === 'craft-select-rod') {
					selectedParts.rod.id = i.values[0];
					selectedParts.rod.object = await ItemData.findById(i.values[0]);
					await i.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('Crafting')
								.setDescription('Select the reel piece of your choice!'),
						],
						components: [secondActionRow],
					});
				}
				else if (i.customId === 'craft-select-reel') {
					selectedParts.reel.id = i.values[0];
					selectedParts.reel.object = await ItemData.findById(i.values[0]);
					await i.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('Crafting')
								.setDescription('Select the hook piece of your choice!'),
						],
						components: [thirdActionRow],
					});
				}
				else if (i.customId === 'craft-select-hook') {
					selectedParts.hook.id = i.values[0];
					selectedParts.hook.object = await ItemData.findById(i.values[0]);
					await i.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('Crafting')
								.setDescription('Select the handle piece of your choice!'),
						],
						components: [fourthActionRow],
					});
				}
				else if (i.customId === 'craft-select-handle') {
					selectedParts.handle.id = i.values[0];
					selectedParts.handle.object = await ItemData.findById(i.values[0]);
					await i.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('Crafting')
								.setDescription(`You have selected:\n **Rod**: ${selectedParts.rod.object.name}\n **Reel**: ${selectedParts.reel.object.name}\n **Hook**: ${selectedParts.hook.object.name}\n **Handle**: ${selectedParts.handle.object.name}\n\n Would you like to submit?`),
						],
						components: [fifthActionRow],
					});
				}
			}
			catch (error) {
				console.error(error);
			}
		});

		// client.on(Events.InteractionCreate, async (interaction) => {
		// 	if (!interaction.isModalSubmit()) return;
		
		// 	// Get the data entered by the user
		// 	const itemName = interaction.fields.getTextInputValue('nameInput');
		// 	const rodPart = await Item.findById(interaction.fields.getStringSelectMenuValue('craft-select-rod'));
		// 	const reelPart = await Item.findById(interaction.fields.getStringSelectMenuValue('craft-select-reel'));
		// 	const hookPart = await Item.findById(interaction.fields.getStringSelectMenuValue('craft-select-hook'));
		// 	const handlePart = await Item.findById(interaction.fields.getStringSelectMenuValue('craft-select-handle'));

		// 	const rodObject = {
		// 		name: itemName,
		// 		rod: rodPart,
		// 		reel: reelPart,
		// 		hook: hookPart,
		// 		handle: handlePart,
		// 	}

		// 	const rod = new FishingRod(rodObject);
		// 	await rod.generateStats();
		// });
	},
};
