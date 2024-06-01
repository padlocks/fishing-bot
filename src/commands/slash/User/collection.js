const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User, getUser } = require('../../../class/User');
const buttonPagination = require('../../../buttonPagination');
const { getFishByName } = require('../../../util/Fish');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('collection')
		.setDescription('Check your fish collection!'),
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
			const user = new User(await getUser(target.id));

			const fields = [];
			const stats = await user.getStats();
			for (const [key] of stats.fishStats) {
				const fish = await getFishByName(key);
				if (!fish) continue;
				const value = `
				${fish.description}
				**Caught:** ${stats.fishStats.get(key)}
				`;
				fields.push({
					name: fish.name,
					value: value,
					inline: false,
				});
			}

			const chunkSize = 5;

			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);

				embeds.push(
					new EmbedBuilder()
						.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
						.setTitle(`${interaction.user.globalName}'s Collection`)
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
