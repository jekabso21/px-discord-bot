import { 
    GatewayIntentBits, 
    Events, 
    Interaction, 
    TextInputStyle,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    TextChannel,  
    Message,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    CacheType,
    ButtonInteraction,
    ModalSubmitInteraction,
    CommandInteraction,
    GuildMember,
    PermissionsBitField,
    ThreadAutoArchiveDuration
} from 'discord.js';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CustomClient } from './client';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';
import { premChecker } from './events/premChecker';
import { addStudentsToDB } from './events/Students'; // replace with the actual path to your function
import pool from './database';

dotenv.config();

const client = new CustomClient({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
] });

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Debug print to log commands
console.log('Registering the following commands:', commands);

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

client.once('ready', async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(client.user!.id, process.env.GUILD_ID!),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands for guild:', process.env.GUILD_ID);
    } catch (error) {
        console.error(error);
    }
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('interactionCreate', async (interaction: Interaction<CacheType>) => {
    if (interaction.isCommand()) {
        const commandInteraction = interaction as CommandInteraction;
        const command = client.commands.get(commandInteraction.commandName);

        if (!command) return;

        // Check permissions for commands requiring special permissions
        if (commandInteraction.commandName === 'adduser' || 
            commandInteraction.commandName === 'removeuser' || 
            commandInteraction.commandName === 'addstudents' || 
            commandInteraction.commandName === 'sendstudentbtn' || 
            commandInteraction.commandName === 'studentlist') {
            
            const hasPermission = await premChecker(commandInteraction, commandInteraction.user.id);
            if (!hasPermission) return;
        }

        try {
            await command.execute(commandInteraction);
        } catch (error) {
            console.error(error);
            await commandInteraction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        const buttonInteraction = interaction as ButtonInteraction;
        const { customId } = buttonInteraction;

        const member = buttonInteraction.member as GuildMember;
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await buttonInteraction.reply({ content: 'You do not have permission to use this button.', ephemeral: true });
            return;
        }

        const message = await buttonInteraction.channel?.messages.fetch(buttonInteraction.message.id);
        if (!message) return;

        const embed = message.embeds[0];
        if (customId === 'approveSuggestion') {
            const updatedEmbed = EmbedBuilder.from(embed)
                .setColor('#33f308')
                .setTitle('Approved Suggestion');
            await message.edit({ embeds: [updatedEmbed], components: [] });
            await buttonInteraction.reply({ content: 'Suggestion approved.', ephemeral: true });
        } else if (customId === 'denySuggestion') {
            const updatedEmbed = EmbedBuilder.from(embed)
                .setColor('#940202')
                .setTitle('Denied Suggestion');
            await message.edit({ embeds: [updatedEmbed], components: [] });
            await buttonInteraction.reply({ content: 'Suggestion denied.', ephemeral: true });
        } else if (customId === 'discussSuggestion') {
            const thread = await message.startThread({
                name: `Discuss: ${message.embeds[0]?.title || 'Suggestion'}`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            });
            await buttonInteraction.reply({ content: `Thread created: ${thread.name}`, ephemeral: true });
        }
    } else if (interaction.isModalSubmit()) {
        const modalInteraction = interaction as ModalSubmitInteraction;
        if (modalInteraction.customId === 'addSuggestion') {
            const msg = modalInteraction.fields.getTextInputValue('written-suggestion');

            if (!modalInteraction.guild) {
                console.error('Guild is null');
                await modalInteraction.reply("Failed to add suggestion: Guild is null");
                return;
            }

            const exampleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Suggestion added by some student')
                .setDescription(msg)
                .setTimestamp();

            const approveButton = new ButtonBuilder()
                .setCustomId('approveSuggestion')
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success);
            
            const denyButton = new ButtonBuilder()
                .setCustomId('denySuggestion')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger);
            
            const discussButton = new ButtonBuilder()
                .setCustomId('discussSuggestion')
                .setLabel('Discuss')
                .setStyle(ButtonStyle.Primary);
            
            const buttonRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(approveButton, denyButton, discussButton);
            
            

            // Get the channel
            const channel = modalInteraction.guild.channels.cache.find(channel => channel.name === 'suggestions') as TextChannel;

            if (!channel) {
                console.error('Channel is null');
                await modalInteraction.reply("Failed to add suggestion: Channel is null");
                return;
            }

            // Send the embed message with buttons and add reactions
            await channel.send({ embeds: [exampleEmbed], components: [buttonRow] }).then((sentMessage: Message) => {
                sentMessage.react('✅');
                sentMessage.react('❌');
            });

            // await modalInteraction.reply("Suggestion added");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
