const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// Inicializamos WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('--------------------------------------------------');
    console.log('¡ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP!');
    console.log('--------------------------------------------------');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('¡WhatsApp está conectado y listo para enviar mensajes!');
});

client.initialize();

// Esta es la "puerta" que va a golpear tu Google Sheets
app.post('/enviar', async (req, res) => {
    const { telefono, mensaje, clave } = req.body;
    
    // Seguridad: tu código secreto
    if (clave !== "OBERABOT2026") {
        return res.status(401).send("Clave incorrecta");
    }

    try {
        // WhatsApp Web necesita que el número termine en @c.us
        const chatId = telefono + "@c.us";
        await client.sendMessage(chatId, mensaje);
        res.status(200).send("Enviado a " + telefono);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al enviar el mensaje");
    }
});

// Arrancamos el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
