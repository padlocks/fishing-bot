const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const buttonPagination = require('../../../buttonPagination');
const { RodData } = require('../../../schemas/RodSchema');
const { getUser } = require('../../../util/User');
module.exports = {
	structure: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Check your stats!'),
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
			const user = await getUser(interaction.user.id);
			const rods = await RodData.find({ user: interaction.user.id });

			let fields = [{
				name: 'Total Fish Caught',
				value: `${user.stats.fishCaught || 0}`,
				inline: false,
			}];

			fields = fields.concat(rods.map((item) => ({
				name: item.name,
				value: `Fish Caught: ${item.fishCaught || 0}`,
				inline: true,
			})));

			user.stats.fishStats.forEach((value, key) => {
				fields.push({
					name: key[0].toUpperCase() + key.slice(1),
					value: value.toLocaleString(),
					inline: true,
				});
			});

			const chunkSize = 6;

			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);

				embeds.push(new EmbedBuilder()
					.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
					.setTitle('Stats')
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
