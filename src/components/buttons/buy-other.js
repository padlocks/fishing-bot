const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { clone, selectionOptions } = require('../../util/Utils');
const { xpToLevel, getUser } = require('../../util/User');
const { Item } = require('../../schemas/ItemSchema');

module.exports = {
	customId: 'buy-other',
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
			options = await Promise.all(await selectionOptions('item'));
			options = options.filter((option) => option !== undefined);

			if (options.length === 0) {
				return await interaction.reply({
					content: 'There is nothing for you to buy!',
					ephemeral: true,
					components: [],
				});
			}

			const select = new StringSelectMenuBuilder()
				.setCustomId('select-item')
				.setPlaceholder('Make a selection!')
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
			const itemChoice = selection.values[0];
			const originalItem = await Item.findById(itemChoice);

			// check if user meets item requirements
			let canBuy = true;

			const userLevel = await xpToLevel(userData.xp);
			if (userLevel < originalItem.toJSON().requirements.level || 0) {
				canBuy = false;
			}

			if (userData.inventory.money < originalItem.price && canBuy) {
				return await selection.update({
					content: 'You do not have enough money to buy this item!',
					ephemeral: true,
					components: [],
				});
			}
			else if (canBuy) {
				userData.inventory.money -= originalItem.price;
				const item = await clone(originalItem, user.id);
				userData.inventory.items.push(item);

				userData.save();
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
		}
		catch (err) {
			// console.error(err);
		}
	},
};