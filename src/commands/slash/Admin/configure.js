const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Pond } = require('../../../schemas/PondSchema');
const { Guild } = require('../../../schemas/GuildSchema');
const config = require('../../../config');
const { generateCommandObject } = require('../../../class/Interaction');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('configure')
		.setDescription('Configure the bot for your server')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addSubcommandGroup((o) => o.setName('pond').setDescription('Manage your ponds')
			.addSubcommand((o) => o.setName('add').setDescription('Add this channel as a pond - To set the current channel as a pond, don\'t provide a channel')
				.addChannelOption(p => p.setName('channel').setRequired(false).setDescription('To set the current channel as a pond, don\'t provide this option'))
				.addIntegerOption(p => p.setName('max').setDescription('The maximum number of fish in the pond').setRequired(false)))
			.addSubcommand((o) => o.setName('remove').setDescription('Remove this channel as a pond - To remove the current channel as a pond, don\'t provide a channel')
				.addChannelOption(p => p.setName('channel').setRequired(false).setDescription('To remove the current channel as a pond, don\'t provide this option'))),
		),
	options: {
		cooldown: 10_000,
	},
	run: async (client, interaction, analyticsObject) => {
		const subcommand = interaction.options.getSubcommand();
		await interaction.deferReply();

		if (process.env.ANALYTICS || config.client.analytics) {
			await generateCommandObject(interaction, analyticsObject);
		}

		if (subcommand === 'pond') {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('No subcommand provided.');
			}
			return await interaction.followUp('Please provide a subcommand.');
		}

		if (subcommand === 'add') {
			const channel = interaction.options.getChannel('channel') || interaction.channel;
			const pondExists = await Pond.findOne({ id: channel.id });
			if (pondExists) {
				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('failed');
					await analyticsObject.setStatusMessage('This channel is already a pond.');
				}
				await interaction.followUp('This channel is already a pond.');
				return;
			}

			const max = interaction.options.getInteger('max') || 2000;

			const pond = new Pond({ id: channel.id, maximum: max, count: max });
			await pond.save();
			const guild = await Guild.findOne({ id: interaction.guild.id });
			guild.ponds.push(channel.id);
			await guild.save();

			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('completed');
				await analyticsObject.setStatusMessage('Added a pond.');
			}

			await interaction.followUp(`Added ${channel} as a pond.`);
			return;
		}
		else if (subcommand === 'remove') {
			const channel = interaction.options.getChannel('channel') || interaction.channel;
			await Pond.findOneAndDelete({ id: channel.id }).exec();
			const guild = await Guild.findOne({ id: interaction.guild.id });
			guild.ponds = guild.ponds.filter((id) => id !== channel.id);
			await guild.save();

			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('completed');
				await analyticsObject.setStatusMessage('Removed a pond.');
			}

			await interaction.followUp(`Removed ${channel} as a pond.`);
			return;
		}
	},
};