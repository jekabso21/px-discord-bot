import { ChatInputCommandInteraction, 
    SlashCommandBuilder, 
    TextInputStyle,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder } from 'discord.js';
import pool from '../database';


export const data = new SlashCommandBuilder()
    .setName('addstudents')
    .setDescription('Adds a students to the database.')

export async function execute(interaction: ChatInputCommandInteraction) {
    const modal: ModalBuilder = new ModalBuilder()
            .setCustomId("addStudents")
            .setTitle("Add Students");

    const studentroleID: TextInputBuilder = new TextInputBuilder()
        .setCustomId("studentroleID")
        .setLabel("Student Role ID")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("1017146469406486529");

    const studentGroupName: TextInputBuilder = new TextInputBuilder()
        .setCustomId("studentGroupName")
        .setLabel("Student Year Group")
        .setPlaceholder("PX22")
        .setStyle(TextInputStyle.Short);
    const Students: TextInputBuilder = new TextInputBuilder()
        .setCustomId("Students")
        .setLabel("All The Students You Want To Add")
        .setPlaceholder("Ivans Līgans:020305-20001, Šmara Pedro:210323-20003")
        .setStyle(TextInputStyle.Paragraph);

    const firstActionRow: any = new ActionRowBuilder().addComponents(studentroleID);
    const secondActionRow: any = new ActionRowBuilder().addComponents(studentGroupName);
    const thirdActionRow: any = new ActionRowBuilder().addComponents(Students);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
    await interaction.showModal(modal);
}
