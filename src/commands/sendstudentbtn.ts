import { ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, TextChannel, ButtonBuilder, ButtonStyle, ActionRowBuilder, Interaction, MessageActionRowComponentBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('sendstudentbtn')
    .setDescription('Sends a button to a specified channel.')
    .addChannelOption(option =>
        option
            .setName('channel')
            .setDescription('Channel to send the button to')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel('channel', true) as TextChannel;

    const button = new ButtonBuilder()
        .setCustomId('send_student_info')
        .setLabel('Send Student Info')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(button);

    await channel.send({
        content: 'Click the button to receive student information:',
        components: [row],
    });

    await interaction.reply({ content: `Button sent to ${channel.name}`, ephemeral: true });
}

// Handle button interaction
export async function handleButton(interaction: Interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'send_student_info') {
        await interaction.reply({ content: 'Student information: [Add your student info here]', ephemeral: true });
    }
}
