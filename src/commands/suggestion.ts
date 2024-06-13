import { ChatInputCommandInteraction, 
    SlashCommandBuilder, 
    TextInputStyle,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('addsuggestion')  // Changed to lowercase
    .setDescription('Add suggestion to the suggestion board.');

export async function execute(interaction: ChatInputCommandInteraction) {
    const modal: ModalBuilder = new ModalBuilder()
        .setCustomId("addSuggestion")
        .setTitle("Add suggestion");

    const Suggestion: TextInputBuilder = new TextInputBuilder()
        .setCustomId("written-suggestion")
        .setLabel("What is your suggestion?")
        .setPlaceholder("Let's make a hackathon!")
        .setStyle(TextInputStyle.Paragraph);

    const firstActionRow: any = new ActionRowBuilder().addComponents(Suggestion);

    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
}
