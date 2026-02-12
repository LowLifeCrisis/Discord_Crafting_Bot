require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('craft')
        .setDescription('Request a crafting order')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('The item to craft')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('How many to craft')
                .setRequired(false)
                .setMinValue(1)),
    
    new SlashCommandBuilder()
        .setName('requests')
        .setDescription('View all pending crafting requests'),
    
    new SlashCommandBuilder()
        .setName('complete')
        .setDescription('Mark a crafting request as complete')
        .addStringOption(option =>
            option.setName('requestid')
                .setDescription('The request ID to complete')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('cancel')
        .setDescription('Cancel a crafting request')
        .addStringOption(option =>
            option.setName('requestid')
                .setDescription('The request ID to cancel')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('update_status')
        .setDescription('Set Order Status')
        .addStringOption(option => 
            option.setName('new_status')
                .setDescription('The new status for the request')
                .setRequired(true)
                .addChoices(
            { name: 'In Progress', value: 'in_progress' },
            { name: 'On Hold', value: 'on_hold' }))
        .addStringOption(option =>
            option.setName('requestid')
                .setDescription('The request ID to update')
                .setRequired(true)),
        
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear all crafting requests')
].map(command => command.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();