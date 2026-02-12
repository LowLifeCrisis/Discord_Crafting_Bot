require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const Database = require('better-sqlite3');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ]
});

// Create/open database file
const db = new Database('crafting.db');

// Create table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        requester_id TEXT NOT NULL,
        requester_name TEXT NOT NULL,
        item TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        status TEXT NOT NULL,
        completed_by TEXT,
        timestamp INTEGER NOT NULL
    )
`);


client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        const { commandName } = interaction;

    try {
        console.log(`Received command: ${commandName}`);

        if (commandName === 'craft') {

            const item = interaction.options.getString('item');
            const quantity = interaction.options.getInteger('quantity') || 1;

            console.log(`Crafting: ${item} x${quantity}`);

            const requestId = Date.now().toString();
            // Insert the request into the database
            const insert = db.prepare(`
            INSERT INTO requests (id, requester_id, requester_name, item, quantity, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)`);

            insert.run(
            requestId,
            interaction.user.id,
            interaction.user.username,
            item,
            quantity,
            'pending',
            Date.now() 
            );
            // Use EmbedBuilder to create a response message
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔨 Crafting Request Submitted')
                .addFields(
                    { name: 'Item', value: item, inline: true },
                    { name: 'Quantity', value: quantity.toString(), inline: true },
                    { name: 'Request ID', value: requestId, inline: false }
                )
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();
            //send the response
            await interaction.reply({ embeds: [embed] });
            console.log('Reply sent successfully');
        }

        if (commandName === 'requests') {
        //Query the database for pending requests
            console.log('Checking requests...');
            
            const pending = db.prepare('SELECT * FROM requests WHERE status = ?').all('pending');
            
            if (pending.length === 0) {
            return await interaction.reply('No pending crafting requests!');
            }
        
                
        //Use EmbedBuilder to create a response message
            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('📋 Pending Crafting Requests')
                .setDescription(pending.map(req => 
                    `**ID:** ${req.id}\n**Item:** ${req.item} x${req.quantity}\n**Requester:** ${req.requester_name}\n`
                ).join('\n'));
        
        //send the response
            await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'complete') {
        //Look up the request by ID
            const requestId = interaction.options.getString('requestid');
            const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(requestId);

            if (!request) {
                return await interaction.reply('Request not found!');
            }

        //Update the request status to completed
           const update = db.prepare('UPDATE requests SET status = ?, completed_by = ? WHERE id = ?');
           update.run('completed', interaction.user.username, requestId);

        //Use EmbedBuilder to create a response message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('✅ Request Completed')
                .addFields(
                    { name: 'Item', value: request.item, inline: true },
                    { name: 'Quantity', value: request.quantity.toString(), inline: true },
                    { name: 'Completed by', value: interaction.user.username, inline: false }
                );
        //send the response
            await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'update_status') {
            const requestId = interaction.options.getString('requestid');
            const newStatus = interaction.options.getString('new_status');
    
            // newStatus will be 'in_progress', 'completed', etc.
            // Update your database here
            const update = db.prepare('UPDATE requests SET status = ? WHERE id = ?');
            update.run(newStatus, requestId);

            // Use EmbedBuilder to create a response message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('✅ Status Updated')
                .addFields(
                    { name: 'Request ID', value: requestId, inline: true },
                    { name: 'New Status', value: newStatus, inline: true }
                );
        //send the response
            await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'cancel') {
            const requestId = interaction.options.getString('requestid');
            const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(requestId);

        // Use EmbedBuilder to create a response message
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('✅ Status Updated')
            .addFields(
                { name: 'Request ID', value: requestId, inline: true },
                { name: 'New Status', value: newStatus, inline: true }
            );
        //send the response
        await interaction.reply({ embeds: [embed] });
        }

        
    } catch(error) {
        console.error('Error handling interaction:', error);
        
        // Try to respond with an error message
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
                content: 'There was an error processing your command!', 
                ephemeral: true 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);