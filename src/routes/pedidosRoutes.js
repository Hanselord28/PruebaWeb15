const express = require('express');
const router = express.Router();
const pedidosControllers = require('../controllers/pedidosControllers');

router.post('/pedidos', pedidosControllers.crearPedido);

router.get('/pedidos', pedidosControllers.listarPedidos);

module.exports = router;
