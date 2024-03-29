/* eslint-disable no-mixed-spaces-and-tabs */
const config = require('../../config');
const { clone } = require('../../util/Utils');
const { getEquippedRod, getUser } = require('../../util/User');
const { Item } = require('../../schemas/ItemSchema');
const { Guild } = require('../../schemas/GuildSchema');
const { Pond } = require('../../schemas/PondSchema');
const { Command } = require('../../schemas/CommandSchema');


const cooldown = new Map();

module.exports = {
	event: 'interactionCreate',
	/**
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').Interaction} interaction
     * @returns
     */
	run: async (client, interaction) => {
		if (!interaction.isCommand()) return;

		if (
			config.handler.commands.slash === false &&
            interaction.isChatInputCommand()
		) {return;}
		if (
			config.handler.commands.user === false &&
            interaction.isUserContextMenuCommand()
		) {return;}
		if (
			config.handler.commands.message === false &&
            interaction.isMessageContextMenuCommand()
		) {return;}

		const command = client.collection.interactioncommands.get(
			interaction.commandName,
		);

		if (!command) return;

		try {
			if (command.options?.developers) {
				if (
					config.users?.developers?.length > 0 &&
                    !config.users?.developers?.includes(interaction.user.id)
				) {
					await interaction.reply({
						content:
                            config.messageSettings.developerMessage !== undefined &&
                                config.messageSettings.developerMessage !== null &&
                                config.messageSettings.developerMessage !== ''
                            	? config.messageSettings.developerMessage
                            	: 'You are not authorized to use this command',
						ephemeral: true,
					});

					return;
				}
				else if (config.users?.developers?.length <= 0) {
					await interaction.reply({
						content:
                            config.messageSettings.missingDevIDsMessage !== undefined &&
                                config.messageSettings.missingDevIDsMessage !== null &&
                                config.messageSettings.missingDevIDsMessage !== ''
                            	? config.messageSettings.missingDevIDsMessage
                            	: 'This is a developer only command, but unable to execute due to missing user IDs in configuration file.',

						ephemeral: true,
					});

					return;
				}
			}

			if (command.options?.nsfw && !interaction.channel.nsfw) {
				await interaction.reply({
					content:
                        config.messageSettings.nsfwMessage !== undefined &&
                            config.messageSettings.nsfwMessage !== null &&
                            config.messageSettings.nsfwMessage !== ''
                        	? config.messageSettings.nsfwMessage
                        	: 'The current channel is not a NSFW channel',

					ephemeral: true,
				});

				return;
			}

			if (command.options?.cooldown) {
				const isGlobalCooldown = command.options.globalCooldown;
				const cooldownKey = isGlobalCooldown ? 'global_' + command.structure.name : interaction.user.id;
				const cooldownFunction = () => {
					const data = cooldown.get(cooldownKey);

					data.push(interaction.commandName);

					cooldown.set(cooldownKey, data);

					setTimeout(() => {
						let messageData = cooldown.get(cooldownKey);

						messageData = messageData.filter((v) => v !== interaction.commandName);

						if (messageData.length <= 0) {
							cooldown.delete(cooldownKey);
						}
						else {
							cooldown.set(cooldownKey, messageData);
						}
					}, command.options.cooldown);
				};

				if (cooldown.has(cooldownKey)) {
					const data = cooldown.get(cooldownKey);

					if (data.some((v) => v === interaction.commandName)) {
						const cooldownMessage = (isGlobalCooldown
							? config.messageSettings.globalCooldownMessage ?? 'Slow down buddy! This command is on a global cooldown ({cooldown}s).'
							: config.messageSettings.cooldownMessage ?? 'Slow down buddy! You\'re too fast to use this command ({cooldown}s).').replace(/{cooldown}/g, command.options.cooldown / 1000);

						await interaction.reply({
							content: cooldownMessage,
							ephemeral: true,
						});

						return;
					}
					else {
						cooldownFunction();
					}
				}
				else {
					cooldown.set(cooldownKey, [interaction.commandName]);
					cooldownFunction();
				}
			}

			const guildData = await Guild.findOne({ id: interaction.guild.id });
			if (!guildData) {
				const newGuild = new Guild({ id: interaction.guild.id });
				await newGuild.save();
			}

			// check if it is a new day and reset the pond
			const pond = await Pond.findOne({ id: interaction.channel.id });
			if (pond && pond.lastFished) {
				const lastFished = new Date(pond.lastFished);
				const now = new Date();
				if (now.getDate() > lastFished.getDate()) {
					pond.count = 1000;
					pond.lastFished = now;
					await pond.save();
				}
			}

			const data = (await getUser(interaction.user.id));
			const equippedRod = await getEquippedRod(interaction.user.id);
			if (!equippedRod || (equippedRod.name === 'Old Rod' && equippedRod.state === 'destroyed')) {
				const rod = await Item.findOne({ name: 'Old Rod' });
				const clonedRod = await clone(rod, interaction.user.id);
				clonedRod.obtained = Date.now();
				data.inventory.rods = [];
				data.inventory.rods.push(clonedRod);
				data.inventory.equippedRod = clonedRod;
			}

			data.commands += 1;
			data.save();

			const commandObject = new Command({
				user: interaction.user.id,
				command: interaction.commandName,
				time: Date.now(),
				channel: interaction.channel.id,
				guild: interaction.guild.id,
				type: 'command',
			});
			await commandObject.save();

			command.run(client, interaction);
		}
		catch (error) {
			console.error(error);
		}
	},
};