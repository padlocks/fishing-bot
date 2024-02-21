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

		await interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setTitle('Fished!')
					.addFields(
						{name: 'Congratulations!', value: `<${f.icon?.animated ? 'a' : ''}:${f.icon.data}> You caught **${f.rarity}** ${f.name}!`},
					),
			],
			components: [
				new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('fish-again')
							.setLabel('Fish again!')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('sell-one-fish')
							.setLabel('Sell')
							.setStyle(ButtonStyle.Danger),
					),
			],
		});
	},
};
