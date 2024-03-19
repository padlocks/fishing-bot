const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const buttonPagination = require('../../../buttonPagination');
const { RodData } = require('../../../schemas/RodSchema');
const { getUser, xpToLevel, xpToNextLevel } = require('../../../util/User');
const { log } = require('../../../util/Utils');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Check someone\'s profile!')
		.addUserOption((opt) =>
			opt.setName('user')
				.setDescription('The user.')
				.setRequired(false),
		),
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
			const target = interaction.options.getUser('user') || interaction.user;
			const user = await getUser(target.id);
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
			console.error(err);
		}
	},
};
