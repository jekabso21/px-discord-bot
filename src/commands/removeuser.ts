import { ChatInputCommandInteraction, SlashCommandBuilder, User } from 'discord.js';
import pool from '../database';
import { premChecker } from '../events/premChecker';

export const data = new SlashCommandBuilder()
    .setName('removeuser')
    .setDescription('Adds a user to the database.')
    .addUserOption(option =>
        option
            .setName('target')
            .setDescription('Remove to add')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('target', true);
    console.log(interaction)
    console.log(interaction.user)
    const hasPermission = await premChecker(interaction, interaction.user.id);
    if (!hasPermission) return;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            'DELETE FROM users WHERE id = ?',
            [user.id]
        );
        connection.release();
        await interaction.reply(`User ${user.username} has been removed from the database.`);
    } catch (error) {
        console.error(error);
        await interaction.reply('There was an error while removing the user from the database.');
    }
}
