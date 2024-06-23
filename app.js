// app.js
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { Client, Message } = require('azure-iot-device');
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const connectionString = process.env.connectionString;



const config = require('./config');

// Configura el cliente de dispositivo IoT
const client = Client.fromConnectionString(config.connectionString, Protocol);

client.open((err) => {
    if (err) {
        console.error('Error al conectar al IoT Hub:', err);
        return;
    }
    console.log('Conexión exitosa al IoT Hub');

    // Simula el envío de mensajes periódicos al IoT Hub
    setInterval(() => {
        const temperature = Math.random() * 100;
        const humidity = Math.random() * 100;
        
        const data = {
            'Temperatura (°C)': temperature.toFixed(2),
            'Humedad (%)': humidity.toFixed(2)
        };

        console.table(data);

        const message = new Message(JSON.stringify(data));
        client.sendEvent(message, (err, res) => {
            if (err) {
                console.error('Error al enviar el mensaje:', err.toString());
            }
            if (res) {
                console.log('Estado del envío:', res.constructor.name);
            }
            // Envía los datos al cliente web a través de Socket.io
            io.emit('data', data); // Envía los datos sin necesidad de parsear de nuevo
        });
    }, 5000); // Envía un mensaje cada 5 segundos
});

// Configura la aplicación web
app.use(express.static('public'));

// Inicia el servidor
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
