const { ActionRowBuilder, StringSelectMenuBuilder, ButtonStyle, ButtonBuilder, ComponentType } = require('discord.js');
const { clone, selectionOptions } = require('../../util/Utils');
const { xpToLevel, getUser, getAllBaits } = require('../../util/User');
const { Item, ItemData } = require('../../schemas/ItemSchema');

module.exports = {
	customId: 'buy-bait',
	/**
	 *
	 * @param {ExtendedClient} client
	 * @param {ButtonInteraction} interaction
	 */
	run: async (client, interaction) => {
		const user = interaction.user;
		const userData = await getUser(user.id);

		const collectorFilter = i => {
			return i.user.id === user.id;
		};

		try {
			let options = [];
			options = await Promise.all(await selectionOptions('bait'));
			options = options.filter((option) => option !== undefined);

			if (options.length === 0) {
				return await interaction.reply({
					content: 'There is no bait for you to buy!',
					ephermeral: true,
					components: [],
				});
			}

			const select = new StringSelectMenuBuilder()
				.setCustomId('select-bait')
				.setPlaceholder('Select a kind of bait to buy...')
				.addOptions(options);

			const row = new ActionRowBuilder()
				.addComponents(select);

			// check for additional action rows and remove them
			const components = interaction.message.components;
			const firstActionRow = components.find(r => r.type === ComponentType.ActionRow);
			const secondActionRow = components.find((r, index) => r.type === ComponentType.ActionRow && index !== components.indexOf(firstActionRow));
			components.length = 0;
			components.push(firstActionRow);
			components.push(secondActionRow);

			const response = await interaction.update({
				embeds: interaction.message.embeds,
				components: [...components, row],
			});

			const selection = await response.awaitMessageComponent({ filter: collectorFilter, time: 30_000 });
			const baitChoice = selection.values[0];
			const originalItem = await Item.findById(baitChoice);

			// check if user meets item requirements
			const userLevel = await xpToLevel(userData.xp);
			if (userLevel < originalItem.toJSON().requirements.level) {
				return await selection.reply({
					content: `You need to be level ${originalItem.toJSON().requirements.level} to buy this item!`,
					ephermeral: true,
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
				embeds: selection.message.embeds,
				components: [...selection.message.components, amountRow],
			});

			const amountSelection = await amountResponse.awaitMessageComponent({ filter: collectorFilter, time: 30_000 });
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
				return await amountSelection.reply({
					content: 'You do not have enough money to buy this item!',
					ephemeral: true,
					components: [],
				});
			}
			else {
				userData.inventory.money -= originalItem.price * amount;
				// check if user has the bait in their inventory
				let item;
				const baits = await getAllBaits(userData.userId);
				const itemId = baits.find((bait) => bait.name === originalItem.name);
				if (itemId) {
					item = await ItemData.findById(itemId) || {};
					item.count += amount;
					await item.save();
				}
				else {
					item = await clone(originalItem, user.id);
					item.count = amount;
					userData.inventory.baits.push(item);
					await item.save();
					await userData.save();
				}

				await amountSelection.reply({
					components: [],
					content: `You have successfully bought ${amount} ${originalItem.name}!`,
					ephemeral: true,
				});
			}
		}
		catch (err) {
			// console.error(err);
		}
	},
};