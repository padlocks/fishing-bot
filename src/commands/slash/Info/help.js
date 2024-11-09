const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');
const buttonPagination = require('../../../buttonPagination');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('help')
		.setDescription('View all the possible commands!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction, analyticsObject) => {
		const mapIntCmds = client.applicationcommandsArray.map((v) => `\`${(v.type === 2 || v.type === 3) ? '' : '/'}${v.name}\`: ${v.description || '(No description)'}`);
		// const mapPreCmds = client.collection.prefixcommands.map((v) => `\`${prefix}${v.structure.name}\` (${v.structure.aliases.length > 0 ? v.structure.aliases.map((a) => `**${a}**`).join(', ') : 'None'}): ${v.structure.description || '(No description)'}`);

		// Sort the commands alphabetically
		mapIntCmds.sort();

		if (process.env.ANALYTICS || config.client.analytics) {
			await analyticsObject.setStatus('completed');
			await analyticsObject.setStatusMessage('Displayed help command.');
		}

		const embeds = [];
		let fields = [];
		fields = mapIntCmds.map((cmd) => ({
			name: cmd.split(':')[0],
			value: `${cmd.split(':')[1]}`,
			inline: false,
		}));

		const chunkSize = 10;

		for (let i = 0; i < fields.length; i += chunkSize) {
			const chunk = fields.slice(i, i + chunkSize);

			embeds.push(new EmbedBuilder()
				.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
				.setTitle('Command List')
				.setColor('Blue')
				.addFields(chunk),
			);
		}

		await buttonPagination(interaction, embeds);

	},
};
