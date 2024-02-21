const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const { generateFish } = require('../../../functions')
const { Fish } = require('../../../schemas/FishSchema');
const { User } = require('../../../schemas/UserSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Check your inventory!'),
    options: {
        cooldown: 15000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {

        await interaction.deferReply();

        const user = await User.findOne({ userId: interaction.user.id });

    if (!user) {
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Error")
                    .setDescription("Something went wrong.")
                    .setColor('Red')
            ]
        });
    } else {
        let fields = [];
let nameCounter = {};
let maxCounterPerName = {};

if (user.inventory.fish && Array.isArray(user.inventory.fish)) {
    // Use map to create an array of promises
    const fishPromises = user.inventory.fish.map(async (fishObject) => {
        let fish = await Fish.findById(fishObject.valueOf());
        let name = fish.name;

        // Count occurrences of each fish.name
        nameCounter[name] = (nameCounter[name] || 0) + 1;

        // Add counter to fish.name
        let counter = nameCounter[name];
        fish.name = `${name} (${counter})`;

        // Update max counter for each unique fish.name
        maxCounterPerName[name] = Math.max(counter, maxCounterPerName[name] || 0);

        if (counter > 1) {
            fish.value += (fish.value * (counter - 1));
        }
			return {
				name: `${fish.name}`,
				value: `Rarity: ${fish.rarity}\nValue: $${fish.value}`,
				inline: true,
			};
		});

    // Wait for all promises to resolve
    fields = await Promise.all(fishPromises);

    // Filter fields based on the max counter for each unique fish.name
    fields = fields.filter((field) => {
        const name = field.name.match(/^(.*?) \(\d+\)$/)[1]; // Extract fish name without the counter
        const maxCounter = maxCounterPerName[name];
        const counter = parseInt(field.name.match(/\((\d+)\)/)[1]); // Extract counter from the name
        return counter === maxCounter;
    });
}

    let inventoryEmbed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s Inventory`)
        .setColor('Green')
        .addFields(fields);

    await interaction.editReply({
        embeds: [inventoryEmbed]
    });

    }
}
};
