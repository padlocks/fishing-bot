const { default: mongoose } = require('mongoose');
const { Interaction: InteractionSchema } = require('../schemas/InteractionSchema');

class Interaction {
	constructor(data) {
		this.interaction = new InteractionSchema(data);
	}

	save() {
		return this.interaction.save();
	}

	async getId() {
		return this.interaction._id;
	}

	async getInteractionId() {
		return this.interaction.interaction.id;
	}

	async getCommand() {
		return this.interaction.command;
	}

	async getUser() {
		return this.interaction.user;
	}

	async getTime() {
		return this.interaction.time;
	}

	async getChannel() {
		return this.interaction.channel;
	}

	async getGuild() {
		return this.interaction.guild;
	}

	async getType() {
		return this.interaction.type;
	}

	async getCommand() {
		return this.interaction.command;
	}

	async setCommand(command) {
		this.interaction.command = command;
		return this.interaction.save();
	}

	async getInteractions() {
		return this.interaction.interactions;
	}

	async pushInteraction(interaction) {
		this.interaction.interactions.push(interaction);
		return this.interaction.save();
	}

	async getStatus() {
		return this.interaction.status;
	}

	async setStatus(status) {
		this.interaction.status = status;
		return this.interaction.save();
	}

	async getStatusMessage() {
		return this.interaction.statusMessage;
	}

	async setStatusMessage(message) {
		this.interaction.statusMessage = message;
		return this.interaction.save();
	}
}

module.exports = { Interaction };