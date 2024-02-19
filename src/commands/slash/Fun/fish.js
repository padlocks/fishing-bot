const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const { fish, generateXP } = require('../../../functions')
const GuildSchema = require('../../../schemas/GuildSchema');
const { User } = require('../../../schemas/UserSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Fish!'),
    options: {
        cooldown: 5000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {

        await interaction.deferReply();

        let f = await fish("");
        let user = await User.findOne({ userId: interaction.user.id })
        if (user) {
            user.inventory.fish.push(f);
            user.stats.fishCaught++;
            user.stats.latestFish = f;
            user.stats.soldLatestFish = false
            user.xp += generateXP()
            user.save()
        }

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Fished!')
                    .addFields(
                        { name: 'Congratulations!', value: `You caught **${f.rarity}** ${f.name}!` },
                    )
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('sell-one-fish')
                            .setLabel('Sell')
                            .setStyle(ButtonStyle.Danger)
                    )
            ]
        });

    }
};
