const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Pond } = require('../../../schemas/PondSchema');
const { Guild } = require('../../../schemas/GuildSchema');
const config = require('../../../config');
const { Interaction } = require('../../../class/Interaction');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('configure')
		.setDescription('Configure the bot for your server')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)

		// Channel configuration
		.addSubcommandGroup((o) => o.setName('channels').setDescription('Manage the channels the bot can be used in.')
			.addSubcommand((o) => o.setName('add-channel').setDescription('Add a channel to the whitelist.')
				.addChannelOption(p => p.setName('channel').setRequired(false).setDescription('To set the current channel as a bot channel, don\'t provide this option')))
			.addSubcommand((o) => o.setName('remove-channel').setDescription('Remove a channel from the whitelist.')
				.addChannelOption(p => p.setName('channel').setRequired(false).setDescription('To remove the current channel as a bot channel, don\'t provide this option')))
			.addSubcommand((o) => o.setName('list-channels').setDescription('List all bot channels')))

		// Pond configuration
		.addSubcommandGroup((o) => o.setName('pond').setDescription('Manage your ponds')
			.addSubcommand((o) => o.setName('add-pond').setDescription('Add this channel as a pond - To set the current channel as a pond, don\'t provide a channel')
				.addChannelOption(p => p.setName('channel').setRequired(false).setDescription('To set the current channel as a pond, don\'t provide this option'))
				.addIntegerOption(p => p.setName('max').setDescription('The maximum number of fish in the pond').setRequired(false)))
			.addSubcommand((o) => o.setName('remove-pond').setDescription('Remove this channel as a pond - To remove the current channel as a pond, don\'t provide a channel')
				.addChannelOption(p => p.setName('channel').setRequired(false).setDescription('To remove the current channel as a pond, don\'t provide this option')))),
	options: {
		cooldown: 10_000,
	},
	run: async (client, interaction, analyticsObject) => {
		const subcommand = interaction.options.getSubcommand();
		await interaction.deferReply();

		if (process.env.ANALYTICS || config.client.analytics) {
			await Interaction.generateCommandObject(interaction, analyticsObject);
		}

		if (subcommand === 'channels') {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('No subcommand provided.');
			}
			return await interaction.followUp('Please provide a subcommand.');
		}

		if (subcommand === 'add-channel') {
			const channel = interaction.options.getChannel('channel') || interaction.channel;
			const guild = await Guild.findOne({ id: interaction.guild.id });
			if (guild.channels.includes(channel.id)) {
				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('failed');
					await analyticsObject.setStatusMessage('This channel is already a bot channel.');
				}
				return await interaction.followUp({ content: 'This channel is already a bot channel.', ephemeral: true });
			}

			guild.channels.push(channel.id);
			await guild.save();
			return await interaction.followUp({ content: `Added ${channel} as a bot channel.`, ephemeral: true });
		}

		if (subcommand === 'remove-channel') {
			const channel = interaction.options.getChannel('channel') || interaction.channel;
			const guild = await Guild.findOne({ id: interaction.guild.id });
			if (!guild.channels.includes(channel.id)) {
				if (process.env.ANALYTICS || config.client.analytics) {
					await analyticsObject.setStatus('failed');
					await analyticsObject.setStatusMessage('This channel is not a bot channel.');
				}
				return await interaction.followUp({ content: 'This channel is not a bot channel.', ephemeral: true });
			}

			guild.channels = guild.channels.filter((id) => id !== channel.id);
			await guild.save();
			return await interaction.followUp({ content: `Removed ${channel} as a bot channel.`, ephemeral: true });
		}

		if (subcommand === 'list-channels') {
			const guild = await Guild.findOne({ id: interaction.guild.id });
			const channels = guild.channels.map((id) => `<#${id}>`);
			const embed = new EmbedBuilder()
				.setTitle('Bot Channels')
				.setDescription(channels.join('\n') || 'No bot channels set.')
				.setColor('Green');
			return await interaction.followUp({ embeds: [embed], ephemeral: true });
		}

		if (subcommand === 'pond') {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('No subcommand provided.');
			}
			return await interaction.followUp('Please provide a subcommand.');
		}

		if (subcommand === 'add-pond') {
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
		else if (subcommand === 'remove-pond') {
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