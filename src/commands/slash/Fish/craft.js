const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Events, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { User } = require('../../../class/User');
const { FishingRod } = require('../../../class/FishingRod');
const { CustomRodData } = require('../../../schemas/CustomRodSchema');
const { ItemData } = require('../../../schemas/ItemSchema');
const { Utils } = require('../../../class/Utils');
const config = require('../../../config');
const { Interaction } = require('../../../class/Interaction');

const getSelectionOptions = async (parts, userId) => {
	if (!parts) return [];

	// sort parts alphabetically
	parts.sort((a, b) => {
		return a.name.localeCompare(b.name);
	});

	const uniqueValues = new Set();
	const uniqueNames = new Set();
	let options = [];
	const partPromises = parts.map(async (part) => {
		try {
			const value = part._id.toString();

			if (!uniqueValues.has(value) && !uniqueNames.has(part.name)) {
				uniqueValues.add(value);
				uniqueNames.add(part.name);

				// get the count of the part
				// const count = await ItemData.countDocuments({ name: part.name, user: userId });
				const parts = await ItemData.find({ name: part.name, user: userId });
				const count = parts.reduce((acc, part) => acc + part.count, 0);

				return new StringSelectMenuOptionBuilder()
					.setLabel(part.name)
					.setDescription(`${count}x | ${part.description}`)
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
	async run(client, interaction, analyticsObject, user = null) {
		if (user === null) user = interaction.user;
		await interaction.deferReply();

		const name = interaction.options.getString('name');

		const userData = new User(await User.get(user.id));
		const userId = await userData.getUserId();
		const items = await userData.getItems();
		const parts = items.filter((item) => item.type.includes('part_'));

		const rodParts = parts.filter((part) => part.type.includes('part_rod'));
		const rodOptions = await getSelectionOptions(rodParts, userId);
		if (rodOptions.length === 0) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('User does not have any rod parts!');
			}
			return interaction.editReply('You do not have any rod parts!');
		}

		const reelParts = parts.filter((part) => part.type.includes('part_reel'));
		const reelOptions = await getSelectionOptions(reelParts, userId);
		if (reelOptions.length === 0) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('User does not have any reel parts!');
			}
			return interaction.editReply('You do not have any reel parts!');
		}

		const hookParts = parts.filter((part) => part.type.includes('part_hook'));
		const hookOptions = await getSelectionOptions(hookParts, userId);
		if (hookOptions.length === 0) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('User does not have any hook parts!');
			}
			return interaction.editReply('You do not have any hook parts!');
		}

		const handleParts = parts.filter((part) => part.type.includes('part_handle'));
		const handleOptions = await getSelectionOptions(handleParts, userId);
		if (handleOptions.length === 0) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('User does not have any handle parts!');
			}
			return interaction.editReply('You do not have any handle parts!');
		}

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

		const collector = response.createMessageComponentCollector({ filter: Utils.getCollectionFilter(['craft-select-rod', 'craft-select-reel', 'craft-select-hook', 'craft-select-handle', 'craft-rod-submit', 'craft-rod-cancel'], user.id), time: 90_000 });
		collector.on('collect', async i => {
			if (process.env.ANALYTICS || config.client.analytics) {
				await Interaction.generateCommandObject(i, analyticsObject);
			}
			try {
				if (i.customId === 'craft-rod-cancel') {
					if (process.env.ANALYTICS || config.client.analytics) {
						await analyticsObject.setStatus('completed');
						await analyticsObject.setStatusMessage('User has cancelled crafting');
					}
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
					const userData = new User(await User.get(user.id));
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

					if (process.env.ANALYTICS || config.client.analytics) {
						await analyticsObject.setStatus('completed');
						await analyticsObject.setStatusMessage('User has crafted a custom rod');
					}

					await i.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('Crafting')
								.setDescription('Crafting has been completed!')
								.addFields([{name: name, value: `**Rod**: ${selectedParts.rod.object.name}\n **Reel**: ${selectedParts.reel.object.name}\n **Hook**: ${selectedParts.hook.object.name}\n **Handle**: ${selectedParts.handle.object.name}`}]),
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
				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('failed');
					await analyticsObject.setStatusMessage(error);
				}
				console.error(error);
			}
		});
	},
};
