const express = require('express');
const router = express.Router();
const pedidosControllers = require('../controllers/pedidosControllers');

router.post('/', pedidosControllers.crearPedido);
router.get('/', pedidosControllers.listarPedidos);

module.exports = router;
