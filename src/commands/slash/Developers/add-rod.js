/* eslint-disable no-negated-condition */
const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const { Rod } = require('../../../schemas/RodSchema');
const { log } = require('../../../util/Utils');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('add-rod')
		.setDescription('Adds a rod to the bot.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('Name of the rod.')
				.setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('description')
				.setDescription('Description for the rod.')
				.setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('rarity')
				.setDescription('Rarity of the rod.')
				.setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('capabilities')
				.setDescription('Capabilities of the rod.')
				.setRequired(false),
		)
		.addStringOption(option =>
			option
				.setName('requirements')
				.setDescription('Requirements to use the rod.')
				.setRequired(false),
		),
	options: {
		developers: true,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
	async run(client, interaction) {
		await interaction.deferReply();

		const name = interaction.options.getString('name');
		const description = interaction.options.getString('description');
		const rarity = interaction.options.getString('rarity');
		const capabilities = interaction.options.getString('capabilities')?.split(',');
		const requirements = interaction.options.getString('requirements')?.split(',');

		try {
			let rodData = (await Rod.findOne({ name: name }));
			if (!rodData) {
				rodData = new Rod({
					name: name,
					description: description,
					rarity: rarity,
					capabilities: capabilities,
					requirements: requirements,
				});
				rodData.save();
			}
			else {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle('Error')
							.setDescription('Rod with name already exists.')
							.setColor('Red'),
					],
				});
			}

			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Rod Added')
						.setDescription('Successfully added the rod to the registry.')
						.setColor('Green'),
				],
			});
		}
		catch (err) {
			console.error(err);
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Error')
						.setDescription('Something went wrong.')
						.setColor('Red'),
				],
			});
		}
	},
};
