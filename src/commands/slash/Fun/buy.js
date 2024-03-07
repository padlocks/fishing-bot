const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const { Item } = require('../../../schemas/ItemSchema');
const { getUser, xpToLevel } = require('../../../util/User');
const { log, clone } = require('../../../util/Utils');

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

		const shopItems = await Item.find({ shopItem: true });
		const uniqueValues = new Set();

		let options = [];
		const itemPromises = shopItems.map(async (item) => {
			try {
				const value = item._id.toString();

				if (!uniqueValues.has(value)) {
					uniqueValues.add(value);

					return new StringSelectMenuOptionBuilder()
						.setLabel(item.name)
						.setDescription(`$${item.price} | ${item.description}`)
						.setEmoji(item.toJSON().icon.data.split(':')[1])
						.setValue(value);
				}

			}
			catch (error) {
				log(error, 'err');
			}
		});

		options = await Promise.all(itemPromises);
		options = options.filter((option) => option !== undefined);

		const select = new StringSelectMenuBuilder()
			.setCustomId('buy-item')
			.setPlaceholder('Make a selection!')
			.addOptions(options);

		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			content: 'What would you like to buy?',
			components: [row],
		});

		const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 15000 });

		collector.on('collect', async i => {
			const selection = i.values[0];
			const userData = await getUser(user.id);
			const originalItem = await Item.findById(selection);

			// check if user meets item requirements
			let canBuy = true;
			let reqLevel = 0;
			originalItem.requirements.forEach(async (requirement) => {
				if (requirement.toLowerCase().includes('level')) {
					reqLevel = requirement.split(' ')[1];
					const level = await xpToLevel(userData.xp);

					if (level < reqLevel) {
						canBuy = false;
						return;
					}
				}
			});

			if (userData.inventory.money < originalItem.price && canBuy) {
				await i.reply({
					content: `${i.user}, you don't have enough money for that!`,
					ephemeral: true,
				});
			}
			else if (canBuy) {
				userData.inventory.money -= originalItem.price;

				let item;
				if (originalItem.name.toLowerCase().includes('rod')) {

					item = await clone(originalItem, user.id);
					userData.inventory.rods.push(item);
				}
				else {
					item = await clone(originalItem, user.id);
					userData.inventory.items.push(item);
				}

				userData.save();
				await i.reply(`${i.user} has bought **${item.name}**!`);
			}
			else {
				await i.reply({
					content: `You need to be level ${reqLevel} to buy this item!`,
					ephemeral: true,
				});
			}
		});
	},
};