import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import pool from '../database';

export const data = new SlashCommandBuilder()
    .setName('studentlist')
    .setDescription('Shows the list of students who have signed in and who have not signed in.');

export async function execute(interaction: CommandInteraction) {
    //recover all the students from the database
    const students = await pool.query('SELECT * FROM students');
    //make a list of students who have signed in like this: Jekabs Ošs - ✅ \n Ivars Kociņš - ❌

    const embed = new EmbedBuilder()
        .setTitle('Student List')
        .setDescription(students.map((student: { name: any; lastName: any; hasSignedIn: any; }) => `${student.name} ${student.lastName} - ${student.hasSignedIn ? '✅' : '❌'}`).join('\n'));

    await interaction.reply({ embeds: [embed] });

}
