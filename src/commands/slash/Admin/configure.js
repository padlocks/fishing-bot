const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Pond } = require('../../../schemas/PondSchema');
const { Guild } = require('../../../schemas/GuildSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('configure')
		.setDescription('Configure the bot for your server')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addSubcommandGroup((o) => o.setName('pond').setDescription('Manage your ponds')
			.addSubcommand((o) => o.setName('add').setDescription('Add this channel as a pond - To set the current channel as a pond, don\'t provide a channel').addChannelOption(p => p.setName('channel').setRequired(false).setDescription('To set the current channel as a pond, don\'t provide this option')))
			.addSubcommand((o) => o.setName('remove').setDescription('Remove this channel as a pond - To remove the current channel as a pond, don\'t provide a channel').addChannelOption(p => p.setName('channel').setRequired(false).setDescription('To remove the current channel as a pond, don\'t provide this option'))),
		),
	options: {
		cooldown: 10_000,
	},
	run: async (client, interaction) => {
		const subcommand = interaction.options.getSubcommand();
		await interaction.deferReply();

		if (subcommand === 'pond') {
			await interaction.followUp('Please provide a subcommand.');
			return;
		}

		if (subcommand === 'add') {
			const channel = interaction.options.getChannel('channel') || interaction.channel;
			const pondExists = await Pond.findOne({ id: channel.id });
			if (pondExists) {
				await interaction.followUp('This channel is already a pond.');
				return;
			}

			const pond = new Pond({ id: channel.id });
			await pond.save();
			const guild = await Guild.findOne({ id: interaction.guild.id });
			guild.ponds.push(channel.id);
			await guild.save();
			await interaction.followUp(`Added ${channel} as a pond.`);
			return;
		}
		else if (subcommand === 'remove') {
			const channel = interaction.options.getChannel('channel') || interaction.channel;
			await Pond.findOneAndDelete({ id: channel.id }).exec();
			const guild = await Guild.findOne({ id: interaction.guild.id });
			guild.ponds = guild.ponds.filter((id) => id !== channel.id);
			await guild.save();
			await interaction.followUp(`Removed ${channel} as a pond.`);
			return;
		}
	},
};