const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const { generateFish } = require('../../../functions')
const GuildSchema = require('../../../schemas/GuildSchema');
const { User } = require('../../../schemas/UserSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Fish!'),
    options: {
        cooldown: 15000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {

        await interaction.deferReply();

        let fish = await generateFish();
        let user = await User.findOne({ userId: interaction.user.id })
        if (user) {
            user.inventory.fish.push(fish)
            user.stats.fishCaught++
            user.save()
        }

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Fished!')
                    .addFields(
                        { name: 'Congratulations!', value: `You caught **${fish.rarity}** ${fish.name}!` },
                    )
            ]
        });

    }
};
