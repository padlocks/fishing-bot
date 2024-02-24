const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { FishData } = require('../../../schemas/FishSchema');
const { User } = require('../../../schemas/UserSchema');
const buttonPagination = require('../../../buttonPagination');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Check your inventory!'),
	options: {
		cooldown: 15000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {
		try {
			const embeds = [];

			const user = await User.findOne({ userId: interaction.user.id });

			let fields = [];
			const nameCounter = {};
			const maxCounterPerName = {};

			if (user.inventory.fish && Array.isArray(user.inventory.fish)) {
				// Use map to create an array of promises
				const fishPromises = user.inventory.fish.map(async (fishObject) => {
					const fish = await FishData.findById(fishObject.valueOf());
					const name = fish.name;

					// Count occurrences of each fish.name
					nameCounter[name] = (nameCounter[name] || 0) + fish.count || 1;

					// Add counter to fish.name
					const counter = nameCounter[name];
					fish.name = `${name} (${counter})`;

					// Update max counter for each unique fish.name
					maxCounterPerName[name] = Math.max(counter, maxCounterPerName[name] || 0);

					if (counter > 1) fish.value += (fish.value * (counter - 1));

					let valueString = `Rarity: ${fish.rarity}\nValue: $${fish.value}`;
					if (fish.locked) valueString = `LOCKED\nRarity: ${fish.rarity}\nValue: $${fish.value}`;

					return {
						name: `${fish.name}`,
						value: valueString,
						inline: true,
					};
				});

				// Wait for all promises to resolve
				fields = await Promise.all(fishPromises);

				// Filter fields based on the max counter for each unique fish.name
				fields = fields.filter((field) => {
					// Extract fish name without the counter
					const name = field.name.match(/^(.*?) \(\d+\)$/)[1];
					const maxCounter = maxCounterPerName[name];
					// Extract counter from the name
					const counter = parseInt(field.name.match(/\((\d+)\)/)[1]);
					return counter === maxCounter;
				});
			}

			const chunkSize = 6;

			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);

				embeds.push(new EmbedBuilder()
					.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
					.setTitle(`${interaction.user.username}'s Inventory`)
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
