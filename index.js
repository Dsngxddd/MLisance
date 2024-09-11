const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const mysql = require('mysql');
const config = require('./config/config.json');
const messages = require('./config/messages.json');
const express = require('express');
const app = express();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
    ],
});
const prefix = '!';

const db = mysql.createConnection({
    host: config.MySQL.hostname,
    user: config.MySQL.username,
    password: config.MySQL.password,
    database: config.MySQL.databasename
});

db.connect(err => {
    if (err) throw err;
    console.log(messages.database.console.connected);

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS license_table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            license_key VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            used_ips TEXT,
            buyer VARCHAR(255),
            product VARCHAR(255) NOT NULL,
            UNIQUE KEY (license_key)
        )
    `;
    db.query(createTableQuery, (err, result) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('Table Oluşturuldu.');
        }
    });
});

// Start WebAPI
const licenseCheckApi = require('./API/licensecheck')(db);
app.use('/api', licenseCheckApi);

app.listen(8080, () => {
    console.log('WebAPI started on this URL: http://localhost:8080');
});

const productList = [
    { name: 'MCordSync', value: 'MCordSync' },
    { name: 'MSurvival', value: 'MSurvival' },
    { name: 'MSkyblock', value: 'MSkyblock' },
];

client.on('ready', () => {
    console.log(`Logined as ${client.user.tag}!`);
    if (client.user) {
        updateBotStatus();
        setInterval(updateBotStatus, 5000); // Her 5 saniyede bir güncelle
    } else {
        console.error('client.user mevcut değil.');
    }
    client.guilds.cache.forEach(guild => {
        guild.commands.create({
            name: 'lisansekle',
            description: messages.slashcommands.addlicense.description,
            options: [
                {
                    name: 'licensekey',
                    type: 3,
                    description: 'Özel Lisans Anahtarı (rastgele anahtar için “random” kullanın)',
                    required: true 
                },
                {
                    name: 'username',
                    type: 6, // USER type
                    description: 'Alıcıyı Etiketle',
                    required: true
                },
                {
                    name: 'product',
                    type: 3,
                    description: 'Ürün adı',
                    required: true,
                    choices: productList
                }
            ]
        })

        guild.commands.create({
            name: 'lisansil',
            description: messages.slashcommands.removelicense.description,
            options: [
                {
                    name: 'licensekey',
                    type: 3,
                    description: 'License Key',
                    required: true 
                },
                {
                    name: 'product',
                    type: 3,
                    description: 'Ürün adı',
                    required: true,
                    choices: productList
                }
            ]
        })

        guild.commands.create({
            name: 'lisanseditle',
            description: 'Lisans sisteminde lisans anahtarını düzenleme',
            options: [
                {
                    name: 'licensekey',
                    type: 3,
                    description: 'Orjinal',
                    required: true
                },
                {
                    name: 'newlicensekey',
                    type: 3,
                    description: 'Yeni Lisans Key',
                    required: true
                },
                {
                    name: 'product',
                    type: 3,
                    description: 'Ürün adı',
                    required: true,
                    choices: productList
                }
            ]
        })

        guild.commands.create({
            name: 'satinalaneditle',
            description: messages.slashcommands.editlicensebuyer.description,
            options: [
                {
                    name: 'licensekey',
                    type: 3,
                    description: messages.slashcommands.editlicensebuyer.options.licensekey,
                    required: true
                },
                {
                    name: 'newbuyer',
                    type: 3,
                    description: messages.slashcommands.editlicensebuyer.options.newbuyer,
                    required: true
                },
                {
                    name: 'product',
                    type: 3,
                    description: 'Ürün adı',
                    required: true,
                    choices: productList
                }
            ]
        })

        guild.commands.create({
            name: 'kullaniciyabaglan',
            description: messages.slashcommands.connectedusers.description,
            options: [
                {
                    name: 'licensekey',
                    type: 3,
                    description: messages.slashcommands.connectedusers.options.licensekey,
                    required: true
                },
                {
                    name: 'product',
                    type: 3,
                    description: 'Ürün adı',
                    required: true,
                    choices: productList
                }
            ]
        })

        guild.commands.create({
            name: 'lisanslarim',
            description: 'Kullanıcının kendi lisanslarını gösterir',
        })

        guild.commands.create({
            name: 'ipsil',
            description: 'Belirli bir lisans anahtarından ve üründen bir IP adresi kaldırır',
            options: [
                {
                    name: 'licensekey',
                    type: 3,
                    description: 'Lisans Anahtarı',
                    required: true
                },
                {
                    name: 'product',
                    type: 3,
                    description: 'Ürün adı',
                    required: true,
                    choices: productList
                },
                {
                    name: 'ip',
                    type: 3,
                    description: 'IP adresi',
                    required: true
                }
            ]
        })

        guild.commands.create({
            name: 'ipekle',
            description: 'Belirli bir lisansa IP adresi ekler',
            options: [
                {
                    name: 'licensekey',
                    type: 3,
                    description: 'Lisans Anahtarı',
                    required: true
                },
                {
                    name: 'product',
                    type: 3,
                    description: 'Ürün adı',
                    required: true,
                    choices: productList
                },
                {
                    name: 'ip',
                    type: 3,
                    description: 'IP adresi',
                    required: true
                }
            ]
        })
    });
});

function genrandomlicensekey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        const randomCharacter = characters.charAt(randomIndex);
        code += randomCharacter;
    }
    return code;
}

function updateBotStatus() {
    const sql = 'SELECT COUNT(*) AS licenseCount FROM license_table';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return;
        }
        const licenseCount = results[0].licenseCount;
        console.log(`Toplam lisans sayısı: ${licenseCount}`); // Konsolda lisans sayısını kontrol edin
        if (client.user) {
            try {
                client.user.setActivity(`Toplam Lisans: ${licenseCount}`, { type: 'WATCHING' });
                console.log('Bot durumu başarıyla güncellendi.');
            } catch (error) {
                console.error('Bot durumu güncellenirken hata oluştu:', error);
            }
        }
    });
}


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    // Check for admin permissions
    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (commandName === 'lisansekle' || commandName === 'lisansil' || commandName === 'lisanseditle' || commandName === 'satinalaneditle' || commandName === 'kullaniciyabaglan') {
        if (!isAdmin) {
            interaction.reply({ content: 'Bu komutu kullanmak için yeterli izne sahip değilsiniz.', ephemeral: true });
            return;
        }

        if (commandName === 'lisansekle') {
            let licenseKey = options.getString('licensekey');
            const username = options.getUser('username').id; // Kullanıcı ID'sini alarak kaydedin
            const product = options.getString('product');

            if (licenseKey === 'random') {
				const licenseKey1 = genrandomlicensekey();
				const licenseKey2 = genrandomlicensekey();
				const licenseKey3 = genrandomlicensekey();
				const licenseKey4 = genrandomlicensekey();
				const licenseKey = licenseKey1 + "-" + licenseKey2 + "-" + licenseKey3 + "-" + licenseKey4;
            

            const query = 'INSERT INTO license_table (license_key, username, product) VALUES (?, ?, ?)';
            db.query(query, [licenseKey, username, product], (err, result) => {
                if (err) {
                    interaction.reply({ content: 'Veritabanına ekleme hatası. Lütfen tekrar deneyin.', ephemeral: true });
                    console.error(err);
                    return;
                }

                interaction.reply({ content:`Lisans başarıyla eklendi: ${licenseKey}`, ephemeral: true });
            });
        }} else if (commandName === 'lisansil') {
            const licenseKey = options.getString('licensekey');
            const product = options.getString('product');

            const query = 'DELETE FROM license_table WHERE license_key = ? AND product = ?';
            db.query(query, [licenseKey, product], (err, result) => {
                if (err) {
                    interaction.reply({ content: 'Veritabanından silme hatası. Lütfen tekrar deneyin.', ephemeral: true });
                    console.error(err);
                    return;
                }

                interaction.reply({ content:`Lisans başarıyla silindi: ${licenseKey}`, ephemeral: true });
            });
        } else if (commandName === 'lisanseditle') {
            const licenseKey = options.getString('licensekey');
            const newLicenseKey = options.getString('newlicensekey');
            const product = options.getString('product');

            const query = 'UPDATE license_table SET license_key = ? WHERE license_key = ? AND product = ?';
            db.query(query, [newLicenseKey, licenseKey, product], (err, result) => {
                if (err) {
                    interaction.reply({ content: 'Veritabanında güncelleme hatası. Lütfen tekrar deneyin.', ephemeral: true });
                    console.error(err);
                    return;
                }

                interaction.reply(`Lisans anahtarı başarıyla güncellendi: ${newLicenseKey}`);
            });
        } else if (commandName === 'satinalaneditle') {
            const licenseKey = options.getString('licensekey');
            const newBuyer = options.getString('newbuyer');
            const product = options.getString('product');

            const query = 'UPDATE license_table SET buyer = ? WHERE license_key = ? AND product = ?';
            db.query(query, [newBuyer, licenseKey, product], (err, result) => {
                if (err) {
                    interaction.reply({ content: 'Veritabanında güncelleme hatası. Lütfen tekrar deneyin.', ephemeral: true });
                    console.error(err);
                    return;
                }

                interaction.reply(`Lisans alıcısı başarıyla güncellendi: ${newBuyer}`);
            });
        } else if (commandName === 'kullaniciyabaglan') {
            const licenseKey = options.getString('licensekey');
            const product = options.getString('product');

            const query = 'SELECT used_ips FROM license_table WHERE license_key = ? AND product = ?';
            db.query(query, [licenseKey, product], (err, result) => {
                if (err) {
                    interaction.reply({ content: 'Veritabanında sorgu hatası. Lütfen tekrar deneyin.', ephemeral: true });
                    console.error(err);
                    return;
                }

                if (result.length === 0) {
                    interaction.reply({ content: 'Bu lisans anahtarı ve ürün için kayıt bulunamadı.', ephemeral: true });
                    return;
                }

                let usedIps;
                try {
                    usedIps = JSON.parse(result[0].used_ips);
                } catch (parseError) {
                    console.error('IP verisi JSON formatında değil:', parseError);
                    interaction.reply({ content: 'IP verisi işlenirken bir hata oluştu.', ephemeral: true });
                    return;
                }

                interaction.reply(`Kullanıcıya bağlı IP adresleri: ${usedIps.join(', ')}`);
            });
        }
    } else if (commandName === 'lisanslarim') {
        const userId = interaction.user.id;
        const query = 'SELECT license_key, product FROM license_table WHERE username = ?';
        db.query(query, [userId], (err, results) => {
            if (err) {
                interaction.reply({ content: 'Veritabanı hatası. Lütfen tekrar deneyin.', ephemeral: true });
                console.error(err);
                return;
            }

            if (results.length === 0) {
                interaction.reply({content: 'Hiç lisansınız yok.', ephemeral: true });
                return;
            }

            const licenses = results.map(row => `Ürün: ${row.product} - Lisans Anahtarı: ${row.license_key}`).join('\n');
            interaction.reply({ content: `Lisanslarınız:\n${licenses}`, ephemeral: true });
        });
    }  else if (commandName === 'ipsil') {
    const licenseKey = options.getString('licensekey');
    const product = options.getString('product');
    const ip = options.getString('ip');
    const userId = interaction.user.id;

    const query = 'SELECT used_ips, username FROM license_table WHERE license_key = ? AND product = ?';
    db.query(query, [licenseKey, product], (err, result) => {
        if (err) {
            interaction.reply({ content: 'Veritabanı hatası. Lütfen tekrar deneyin.', ephemeral: true });
            console.error(err);
            return;
        }

        if (result.length === 0) {
            interaction.reply({ content: 'Bu lisans anahtarı ve ürün için kayıt bulunamadı.', ephemeral: true });
            return;
        }

        const licenseData = result[0];
        if (licenseData.username !== userId) {
            interaction.reply({ content: 'Bu lisans anahtarı size ait değil.', ephemeral: true });
            return;
        }

        let usedIps;
        try {
            usedIps = licenseData.used_ips ? JSON.parse(licenseData.used_ips) : [];
        } catch (parseError) {
            console.error('IP verisi JSON formatında değil:', parseError);
            interaction.reply({ content: 'IP verisi işlenirken bir hata oluştu.', ephemeral: true });
            return;
        }

        const updatedIps = usedIps.filter(storedIp => storedIp !== ip);

        const updateQuery = 'UPDATE license_table SET used_ips = ? WHERE license_key = ? AND product = ?';
        db.query(updateQuery, [JSON.stringify(updatedIps), licenseKey, product], (err, result) => {
            if (err) {
                interaction.reply({ content: 'Veritabanı güncelleme hatası. Lütfen tekrar deneyin.', ephemeral: true });
                console.error(err);
                return;
            }

            interaction.reply({ content:`IP adresi başarıyla silindi: ${ip}`, ephemeral: true });
        });
    });
}
  else if (commandName === 'ipekle') {
    const licenseKey = options.getString('licensekey');
    const product = options.getString('product');
    const ip = options.getString('ip');
    const userId = interaction.user.id;

    const query = 'SELECT used_ips, username FROM license_table WHERE license_key = ? AND product = ?';
    db.query(query, [licenseKey, product], (err, result) => {
        if (err) {
            interaction.reply({ content: 'Veritabanı hatası. Lütfen tekrar deneyin.', ephemeral: true });
            console.error(err);
            return;
        }

        if (result.length === 0) {
            interaction.reply({ content: 'Bu lisans anahtarı ve ürün için kayıt bulunamadı.', ephemeral: true });
            return;
        }

        const licenseData = result[0];
        if (licenseData.username !== userId) {
            interaction.reply({ content: 'Bu lisans anahtarı size ait değil.', ephemeral: true });
            return;
        }

        let usedIps;
        try {
            usedIps = licenseData.used_ips ? JSON.parse(licenseData.used_ips) : [];
        } catch (parseError) {
            console.error('IP verisi JSON formatında değil:', parseError);
            interaction.reply({ content: 'IP verisi işlenirken bir hata oluştu.', ephemeral: true });
            return;
        }

        if (!usedIps.includes(ip)) {
            usedIps.push(ip);
        }

        const updateQuery = 'UPDATE license_table SET used_ips = ? WHERE license_key = ? AND product = ?';
        db.query(updateQuery, [JSON.stringify(usedIps), licenseKey, product], (err, result) => {
            if (err) {
                interaction.reply({ content: 'Veritabanı güncelleme hatası. Lütfen tekrar deneyin.', ephemeral: true });
                console.error(err);
                return;
            }

            interaction.reply({ content:`IP adresi başarıyla eklendi: ${ip}`, ephemeral: true });
        });
    });
}

});

client.login(config.botsettings.token);
