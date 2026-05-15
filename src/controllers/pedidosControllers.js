const pedidosModels = require('../models/pedidosModels');



const TABLA_PRECIOS = {
    'Chica':   { base: 3990, extra: 500 },
    'Mediana': { base: 5990, extra: 800 },
    'Grande':  { base: 8490, extra: 1200 }
};


exports.crearPedido = (req, res) => {
    try {
        const { nombre, tamano, ingredientes, cantidad } = req.body;

        let listaIngredientes = [];
        if (Array.isArray(ingredientes)) {
            listaIngredientes = ingredientes;
        } else if (ingredientes) {
            listaIngredientes = [ingredientes];
        }

        if (listaIngredientes.length === 0) {
            return res.status(400).send("Error: Debes seleccionar al menos un ingrediente.");
        }

        const cantidadIngredientes = listaIngredientes.length;

        const ingredientesExtra = Math.max(0, cantidadIngredientes - 3);

        const preciosConfig = TABLA_PRECIOS[tamano];
        
        const precioUnitario = preciosConfig.base + (ingredientesExtra * preciosConfig.extra);

        const cantidadPizzas = parseInt(cantidad, 10) || 1; 
        const totalPedido = precioUnitario * cantidadPizzas;

        const nuevoPedido = {
            id: Date.now(), 
            nombre: nombre.trim(),
            tamano: tamano,
            ingredientes: listaIngredientes.join(', '), 
            precioUnitario: precioUnitario,
            cantidad: cantidadPizzas,
            totalPedido: totalPedido
        };

        pedidosModels.guardar(nuevoPedido);

        res.redirect('/pedidos');

    } catch (error) {
        console.error("Error en el proceso del controlador:", error);
        res.status(500).send("Error interno al procesar tu orden de pizza.");
    }
};


exports.listarPedidos = (req, res) => {
    
    const pedidos = pedidosModels.obtenerTodos();

    
    const totalAcumulado = pedidos.reduce((acumulador, pedido) => acumulador + pedido.totalPedido, 0);


};