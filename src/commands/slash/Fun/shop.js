const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Item } = require('../../../schemas/ItemSchema');
const buttonPagination = require('../../../buttonPagination');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Check the shop!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {
		try {
			const embeds = [];
			const shopItems = await Item.find({ shopItem: true });

			// sort the shopItems by item.type and item.price
			const order = ['rod', 'bait', 'other'];
			shopItems.sort((a, b) => {
				if (a.type === b.type) {
					return a.price - b.price;
				}
				return order.indexOf(a.type) - order.indexOf(b.type);
			});

			let fields = [];
			fields = shopItems.map((item) => ({
				name: item.name,
				value: `${item.description}\n**Price:** $${item.price}`,
				inline: false,
			}));

			const chunkSize = 6;

			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);

				embeds.push(new EmbedBuilder()
					.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
					.setTitle('Shop')
					.setColor('Green')
					.addFields(chunk),
				);
			}

			await buttonPagination(interaction, embeds);
		}
		catch (err) {
			console.error(err);
		}
	},
};
