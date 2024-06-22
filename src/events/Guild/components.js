/* eslint-disable no-mixed-spaces-and-tabs */
const config = require('../../config');
const { log } = require('../../util/Utils');
const { findMostRecentInteraction, generateCommandObject } = require('../../class/Interaction');

module.exports = {
	event: 'interactionCreate',
	/**
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').Interaction} interaction
     * @returns
     */
	run: async (client, interaction) => {
		if (interaction.isCommand()) return;
		const componentPermission = async (component) => {
			if (component.options?.public === false && interaction.user.id !== interaction.message.interaction.user.id) {
				await interaction.reply({
					content:
                        config.messageSettings.notHasPermissionComponent !== undefined &&
                        config.messageSettings.notHasPermissionComponent !== null &&
                        config.messageSettings.notHasPermissionComponent !== ''
                        	? config.messageSettings.notHasPermissionComponent
                        	: 'You do not have permission to use this component',
					ephemeral: true,
				});
				return false;
			}

			return true;
		};

		// get most recent command ran by that user
		let analyticsObject;

		if (process.env.ANALYTICS || config.client.analytics) {
			analyticsObject = await findMostRecentInteraction(interaction.user.id);
		}

		if (interaction.isButton()) {
			const component = client.collection.components.buttons.get(interaction.customId);

			if (!component) return;

			if (!(await componentPermission(component))) return;

			try {
				if (process.env.ANALYTICS || config.client.analytics) {
					await generateCommandObject(interaction, analyticsObject);
				}
				component.run(client, interaction, analyticsObject);
			}
			catch (error) {
				log(error, 'error');
			}

			return;
		}

		if (interaction.isAnySelectMenu()) {
			const component = client.collection.components.selects.get(interaction.customId);

			if (!component) return;

			if (!(await componentPermission(component))) return;

			try {
				if (process.env.ANALYTICS || config.client.analytics) {
					await generateCommandObject(interaction, analyticsObject);
				}
				component.run(client, interaction, analyticsObject);
			}
			catch (error) {
				log(error, 'error');
			}

			return;
		}

		if (interaction.isModalSubmit()) {
			const component = client.collection.components.modals.get(interaction.customId);

			if (!component) return;

			try {
				if (process.env.ANALYTICS || config.client.analytics) {
					await generateCommandObject(interaction, analyticsObject);
				}
				component.run(client, interaction, analyticsObject);
			}
			catch (error) {
				log(error, 'error');
			}

			return;
		}

		if (interaction.isAutocomplete()) {
			const component = client.collection.components.autocomplete.get(interaction.commandName);

			if (!component) return;

			try {
				component.run(client, interaction);
			}
			catch (error) {
				log(error, 'error');
			}

			return;
		}
	},
};
