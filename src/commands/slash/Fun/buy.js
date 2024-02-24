const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const { cloneItem, cloneRod } = require('../../../functions');
const { User } = require('../../../schemas/UserSchema');
const { Item } = require('../../../schemas/ItemSchema');

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
				console.error(`Error fetching item ${item.name}: ${error}`);
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
			const userData = await User.findOne({ userId: user.id });
			const originalItem = await Item.findById(selection);

			let item;
			if (originalItem.name.toLowerCase().includes('rod')) {
				item = await cloneRod(selection, user.id);
				userData.inventory.rods.push(item);
			}
			else {
				item = await cloneItem(selection, user.id);
				userData.inventory.items.push(item);
			}
			if (userData.inventory.money < item.price) {
				await i.reply(`${i.user}, you don't have enough money for that!`);
			}
			else {
				userData.inventory.money -= item.price;
				userData.save();
				await i.reply(`${i.user} has bought **${item.name}**!`);
			}
		});
	},
};
