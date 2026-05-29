const express = require('express');

const app = express();

const pedidosRoutes = require('./src/routes/pedidosRoutes');

const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/pedidos', pedidosRoutes);

app.listen(PORT, () => {
    console.log(`servidor en http://localhost:${PORT}`);
});