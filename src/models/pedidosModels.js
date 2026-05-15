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

        const totalIngredientes = listaIngredientes.length;

        const ingredientesExtra = Math.max(0, totalIngredientes - 3);

        const preciosTamano = TABLA_PRECIOS[tamano] || TABLA_PRECIOS['Mediana']; 
        const precioUnitario = preciosTamano.base + (ingredientesExtra * preciosTamano.extra);

        const cantidadPizzas = parseInt(cantidad) || 1;
        const totalPedido = precioUnitario * cantidadPizzas;

        
        const nuevoPedido = {
            id: Date.now(), 
            nombre,
            tamano,
            ingredientes: listaIngredientes.join(', '),
            precioUnitario,
            cantidad: cantidadPizzas,
            totalPedido
        };

        
        pedidosModels.guardar(nuevoPedido);
        res.redirect('/pedidos');

    } catch (error) {
        console.error(error);
        res.status(500).send("Ocurrió un error al procesar el pedido.");
    }
};

exports.listarPedidos = (req, res) => {
    const pedidos = pedidosModels.obtenerTodos();

    const totalAcumulado = pedidos.reduce((acc, pedido) => acc + pedido.totalPedido, 0);

    let filasTabla = '';
    pedidos.forEach(p => {
        filasTabla += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.tamano}</td>
                <td>${p.ingredientes}</td>
                <td>$${p.precioUnitario.toLocaleString('es-CL')}</td>
                <td>${p.cantidad}</td>
                <td>$${p.totalPedido.toLocaleString('es-CL')}</td>
            </tr>
        `;
    });

    
    if (pedidos.length === 0) {
        filasTabla = `<tr><td colspan="6" style="text-align:center;">No hay pedidos registrados aún.</td></tr>`;
    }


    const htmlResponse = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Lista de Pedidos - Pizzería Don Node</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f4f4f4; }
            .total-row { font-weight: bold; background-color: #e1f5fe; }
            .nav-link { display: inline-block; margin-top: 20px; color: #1e90ff; text-decoration: none; }
        </style>
    </head>
    <body>
        <h1> Lista de Pedidos Registrados</h1>
        
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Tamaño</th>
                    <th>Ingredientes</th>
                    <th>Precio Unitario</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${filasTabla}
                <tr class="total-row">
                    <td colspan="5" style="text-align: right;">Total Acumulado:</td>
                    <td>$${totalAcumulado.toLocaleString('es-CL')}</td>
                </tr>
            </tbody>
        </table>

        <a class="nav-link" href="/">⬅ Volver al formulario de pedido</a>
    </body>
    </html>
    `;

    res.send(htmlResponse);
};

module.exports = { crearPedido: this.crearPedido, listarPedidos: this.listarPedidos };