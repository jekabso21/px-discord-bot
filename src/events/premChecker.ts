import { CommandInteraction } from 'discord.js';
import pool from '../database';

export async function premChecker(interaction: CommandInteraction, userId: string): Promise<boolean> {
    try {
        const connection = await pool.getConnection();
        const result = await connection.query('SELECT * FROM users WHERE id = ?', [interaction.user.id]);
        connection.release();
        if (result.length === 0) {
            await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
            return false;
        }

        return true;
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while checking your permissions.', ephemeral: true });
        return false;
    }
}