const { ButtonInteraction } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const { User } = require('../../schemas/UserSchema');
const { Fish } = require('../../schemas/FishSchema');

module.exports = {
    customId: 'sell-one-fish',
    /**
     * 
     * @param {ExtendedClient} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {

        let user = await User.findOne({ userId: interaction.user.id })
        if (!user) return;

        let fish = user.inventory.fish[user.inventory.fish.length - 1];
        let fishData = await Fish.findById(fish.valueOf());
        let value = fishData.value;
        user.inventory.fish.pop()
        
        try {
            const updatedUser = await User.findOneAndUpdate(
              { userId: user.userId },
              { $set: { 'inventory.fish': user.inventory.fish, 'inventory.money': user.inventory.money + value } },
              { new: true }
            );
        
            if (!updatedUser) {
                await interaction.reply({
                    content: 'There was an error updating your userdata! Your userdata was not changed.',
                    ephemeral: true
                });
            }
        
            await interaction.reply({
                content: `Successfully sold your **${fishData.rarity}** ${fishData.name}!`,
                ephemeral: true
            });
          } catch (err) {
            await interaction.reply({
                content: 'There was an error updating your userdata!',
                ephemeral: true
            });
          }

    }
};