const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const buttonPagination = require('../../../buttonPagination');
const { log, getUser, xpToLevel, xpToNextLevel } = require('../../../functions');
const { RodData } = require('../../../schemas/RodSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Check someone\'s profile!'),
	options: {
		cooldown: 15000,
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
				name: `Level ${await xpToLevel(user.xp) || 0}`,
				value: `${await xpToNextLevel(user.xp)}`,
				inline: false,
			}];

			fields = fields.concat([{
				name: 'Total Fish Caught',
				value: `${user.stats.fishCaught || 0}`,
				inline: false,
			}]);

			fields = fields.concat(rods.map((item) => ({
				name: item.name,
				value: `Fish Caught: ${item.fishCaught || 0}`,
				inline: true,
			})));

			const chunkSize = 6;

			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);

				embeds.push(new EmbedBuilder()
					.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
					.setTitle(`${interaction.user.globalName}'s Profile`)
					.setColor('Green')
					.addFields(chunk),
				);
			}

			await buttonPagination(interaction, embeds);
		}
		catch (err) {
			log(err, 'err');
		}
	},
};
