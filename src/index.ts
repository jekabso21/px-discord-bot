import { 
    GatewayIntentBits, 
    Events, 
    Interaction, 
    TextInputStyle,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder } from 'discord.js';
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

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {

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
        if (interaction.commandName === 'sendstudentbtn') {
            const hasPermission = await premChecker(interaction, interaction.user.id);
            if (!hasPermission) return;
        }
        if (interaction.commandName === 'studentlist') {
            const hasPermission = await premChecker(interaction, interaction.user.id);
            if (!hasPermission) return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === "send_student_info") { // Use customId instead of id
            const modal: ModalBuilder = new ModalBuilder()
            .setCustomId("getStudentInfo")
            .setTitle("Add Students");

            const student_personal_id: TextInputBuilder = new TextInputBuilder()
                .setCustomId("student_personal_id")
                .setLabel("Your Personal code (Personas Kods)")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("010203-20001");


            const firstActionRow: any = new ActionRowBuilder().addComponents(student_personal_id);

            modal.addComponents(firstActionRow);
            await interaction.showModal(modal);
        }
    }
});



client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId === 'addStudents') {
        const studentroleID = interaction.fields.getTextInputValue('studentroleID');
        const studentGroupName = interaction.fields.getTextInputValue('studentGroupName');
        const Students = interaction.fields.getTextInputValue('Students');
        
        if (!interaction.guild) {
            console.error('Guild is null');
            interaction.reply("Failed to add students to the database: Guild is null");
            return;
        }

        try {
            // Check if the role already exists
            let role = interaction.guild.roles.cache.find(r => r.name === studentroleID);
            
            if (!role) {
                // Create the role if it does not exist
                role = await interaction.guild.roles.create({
                    name: studentroleID, // Assuming you meant to use studentroleID here
                });
            }

            console.log(studentGroupName, role.id, Students); // Use console.log instead of print
            // Use the role ID in the addStudentsToDB function
            addStudentsToDB(studentGroupName, role.id, Students)
            .then(() => {
                console.log('Students are added to the database');
                interaction.reply("Students are added to the database");
            })
            .catch(err => {
                console.error('Failed to add students to the database:', err);
                interaction.reply("Failed to add students to the database");
            });
        } catch (err) {
            console.error('Failed to create role:', err);
            interaction.reply("Failed to create role");
        }
    } else if (interaction.customId === 'getStudentInfo') {
        const student_personal_id = interaction.fields.getTextInputValue('student_personal_id');
        try {
            const [rows] = await pool.query('SELECT * FROM students WHERE personalCode = ?', [student_personal_id]);
            if (!rows || rows.length === 0) {
                interaction.reply(`No student found with that personal Code`);
                return undefined;
            }
            if (rows.hasSignedIn) {
                interaction.reply(`Student with that personal Code has already signed in`);
                return;
            }
            const firstname = rows.name;
            const lastname = rows.lastName;
            const grupe = rows.groupName;
            const roleID = rows.roleId;
            const newname = `${firstname}-${lastname}-${grupe}`;

            if (!interaction.guild) {
                console.log('Guild not found');
                return;
            }
        
            // Get the guild member
            const guildMember = interaction.guild.members.cache.get(interaction.user.id);
            if (!guildMember) {
                console.log(`No member found with ID: ${interaction.user.id}`);
                return;
            }
        
            // Change the member's nickname
            await guildMember.setNickname(newname);
        
            // Add the role to the member
            const role = interaction.guild.roles.cache.get(roleID);
            if (!role) {
                console.log(`No role found with ID: ${roleID}`);
                return;
            }
            await guildMember.roles.add(role);
        
            interaction.reply(`Hello <@${interaction.user.id}>, your student name has been set as nickname + the proper role. Do not change the nickname in the server!`);
            await pool.query('UPDATE students SET hasSignedIn = true WHERE personalCode = ?', [student_personal_id]);

            console.log('Student added to the server');
        } catch (error) {
            console.error('Error finding student:', error);
            throw error;
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
