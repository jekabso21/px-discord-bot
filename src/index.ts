import { GatewayIntentBits, PermissionResolvable, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CustomClient } from './client';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';
import { premChecker } from './events/premChecker';
import pool from './database';

dotenv.config();

const client = new CustomClient({ intents: [GatewayIntentBits.Guilds] });

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

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    // Check permissions for commands requiring special permissions
    if (interaction.commandName === 'adduser') {
        const hasPermission = await premChecker(interaction, interaction.user.id);
        if (!hasPermission) return;
    }
    if (interaction.commandName === 'removeuser') {
        const hasPermission = await premChecker(interaction, interaction.user.id);
        if (!hasPermission) return;
    }
    if (interaction.commandName === 'addstudents') {
        const hasPermission = await premChecker(interaction, interaction.user.id);
        if (!hasPermission) return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'addStudents') {
        await interaction.reply({ content: 'Your submission was received successfully!' });
        console.log(interaction.customId)
        const studentroleID = interaction.fields.getTextInputValue('studentroleID');
        const studentGroupName = interaction.fields.getTextInputValue('studentGroupName');
        const Students = interaction.fields.getTextInputValue('Students');
        console.log({ studentroleID, studentGroupName, Students });
    }
});


client.login(process.env.DISCORD_TOKEN);
