/* eslint-disable no-mixed-spaces-and-tabs */
const config = require('../../config');
const { User } = require('../../class/User');
const { Item } = require('../../schemas/ItemSchema');
const { Guild } = require('../../schemas/GuildSchema');
const { Pond } = require('../../schemas/PondSchema');
const { BuffData } = require('../../schemas/BuffSchema');
const { Interaction } = require('../../class/Interaction');
const { Command } = require('../../schemas/CommandSchema')
const { WeatherType } = require('../../schemas/WeatherTypeSchema');
const { WeatherPattern } = require('../../class/WeatherPattern');
const { WeatherPattern: WeatherPatternSchema } = require('../../schemas/WeatherPatternSchema');

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
					pond.count = pond.maximum;
					pond.lastFished = now;
					pond.warning = false;
					await pond.save();
				}
			}

			const data = new User(await User.get(interaction.user.id));
			const equippedRod = await data.getEquippedRod();
			if (!equippedRod || (equippedRod.name === 'Old Rod' && equippedRod.state === 'destroyed')) {
				const rod = await Item.findOne({ name: 'Old Rod' });
				await data.sendToInventory(rod)
					.then(async (newRod) => {
						return await data.setEquippedRod(newRod.item.id);
					});
			}

			await data.incrementCommandCount();
			data.save();

			// check for active buffs
			const activeBuffs = await BuffData.find({ user: interaction.user.id, active: true });
			// check if it has ended
			for (const buff of activeBuffs) {
				if (buff.endTime && buff.endTime <= Date.now()) {
					await data.endBooster(buff.id);
				}
			}

			const analyticsObject = new Interaction({
				user: interaction.user.id,
				channel: interaction.channel.id,
				guild: interaction.guild.id,
				interactions: [],
				status: 'pending',
			});

			const commandObject = new Command({
				user: interaction.user.id,
				command: interaction.commandName,
				options: interaction.options.data || {},
				channel: interaction.channel.id,
				guild: interaction.guild.id,
				interaction: interaction.toJSON(),
				chainedTo: await analyticsObject.getId(),
			});

			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.save();
				await commandObject.save();
				await analyticsObject.setCommand(commandObject._id);
			}

			command.run(client, interaction, analyticsObject);
		}
		catch (error) {
			console.error(error);
		}

		// Update weather data

		// Get the current weather pattern
		const currentDateTime = new Date();
		const currentWeatherPattern = new WeatherPattern(await WeatherPatternSchema.findOne({
			type: 'weather',
			active: true,
		}));

		if (currentWeatherPattern && currentWeatherPattern.isActive()) {
			// Check if the current weather pattern has ended
			if (currentWeatherPattern.getDateEnd() < currentDateTime) {
				// Get the next weather pattern
				const nextWeatherPattern = await currentWeatherPattern.getNextWeatherPattern();

				// Update the current weather pattern
				currentWeatherPattern.setActive(false);
				await currentWeatherPattern.save();

				// Update the next weather pattern
				nextWeatherPattern.setActive(true);
				await nextWeatherPattern.save();

				// Create a new weather pattern, for after 6 days
				const weatherTypes = await WeatherType.find({ type: 'weather' });
				const randomWeatherType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
				const newWeatherPattern = new WeatherPattern({
					weather: randomWeatherType.weather,
					dateStart: new Date(nextWeatherPattern.getDateEnd().getTime() + 6 * 24 * 3600000),
					dateEnd: new Date(nextWeatherPattern.getDateEnd().getTime() + 7 * 24 * 3600000),
					active: false,
					icon: randomWeatherType.icon,
				});
				await newWeatherPattern.save();

				// Find the last weather pattern in the chain and update it to point to the new weather pattern
				let lastWeatherPattern = new WeatherPattern(await WeatherPatternSchema.findOne({ nextWeatherPattern: null }));
				lastWeatherPattern.setNextWeatherPattern(await newWeatherPattern.getId());
			}
		}
	},
};