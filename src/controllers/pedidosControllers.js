const pedidosModels = require('../models/pedidosModels');

const TABLA_PRECIOS = {
    Chica: { base: 3990, extra: 500 },
    Mediana: { base: 5990, extra: 800 },
    Grande: { base: 8490, extra: 1200 }
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
            return res.status(400).send('Error: Debes seleccionar al menos un ingrediente.');
        }

        const preciosConfig = TABLA_PRECIOS[tamano];
        if (!preciosConfig) {
            return res.status(400).send('Error: Tamaño de pizza inválido.');
        }

        const cantidadIngredientes = listaIngredientes.length;
        const ingredientesExtra = Math.max(0, cantidadIngredientes - 3);
        const precioUnitario = preciosConfig.base + ingredientesExtra * preciosConfig.extra;

        const cantidadPizzas = parseInt(cantidad, 10) || 1;
        const totalPedido = precioUnitario * cantidadPizzas;

        const nuevoPedido = {
            id: Date.now(),
            nombre: nombre ? nombre.trim() : '',
            tamano,
            ingredientes: listaIngredientes,
            precioUnitario,
            cantidad: cantidadPizzas,
            totalPedido
        };

        pedidosModels.guardar(nuevoPedido);

        const ingredientesTexto = listaIngredientes.join(', ');
        const htmlSummary = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resumen del pedido - Pizzería Don Node</title>
            <link rel="stylesheet" href="/stylesheet.css">
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-danger">
                <div class="container">
                    <a class="navbar-brand" href="/">Pizzería Don Node</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item"><a class="nav-link" href="/">Nuevo pedido</a></li>
                            <li class="nav-item"><a class="nav-link" href="/pedidos">Lista de pedidos</a></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <main class="container py-5">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="card shadow-sm mb-4">
                            <div class="card-body">
                                <h1 class="h3">Resumen del pedido</h1>
                                <p class="text-muted">Tu pedido fue registrado correctamente. Revisa los detalles antes de continuar.</p>
                                <ul class="list-group list-group-flush mb-4">
                                    <li class="list-group-item"><strong>Cliente:</strong> ${nuevoPedido.nombre}</li>
                                    <li class="list-group-item"><strong>Tamaño:</strong> ${nuevoPedido.tamano}</li>
                                    <li class="list-group-item"><strong>Ingredientes:</strong> ${ingredientesTexto}</li>
                                    <li class="list-group-item"><strong>Precio unitario:</strong> $${nuevoPedido.precioUnitario.toLocaleString('es-CL')}</li>
                                    <li class="list-group-item"><strong>Cantidad:</strong> ${nuevoPedido.cantidad}</li>
                                    <li class="list-group-item"><strong>Total del pedido:</strong> $${nuevoPedido.totalPedido.toLocaleString('es-CL')}</li>
                                </ul>
                                <div class="d-flex gap-2 flex-column flex-sm-row">
                                    <a href="/pedidos" class="btn btn-danger w-100">Ver lista de pedidos</a>
                                    <a href="/" class="btn btn-outline-danger w-100">Realizar otro pedido</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <script src="/bootstrap.bundle.min.js"></script>
        </body>
        </html>
        `;

        res.send(htmlSummary);
    } catch (error) {
        console.error('Error en el proceso del controlador:', error);
        res.status(500).send('Error interno al procesar tu orden de pizza.');
    }
};

exports.listarPedidos = (req, res) => {
    const pedidos = pedidosModels.obtenerTodos();
    const totalAcumulado = pedidos.reduce((acc, pedido) => acc + pedido.totalPedido, 0);
    const pedidoMasCaro = pedidos.length
        ? pedidos.reduce((max, pedido) => (pedido.totalPedido > max.totalPedido ? pedido : max), pedidos[0])
        : null;

    let filasTabla = '';
    pedidos.forEach((p) => {
        const ingredientesTexto = Array.isArray(p.ingredientes)
            ? p.ingredientes.join(', ')
            : p.ingredientes;
        const esMasCaro = pedidoMasCaro && p.id === pedidoMasCaro.id;
        const filaClass = esMasCaro ? 'table-warning' : '';
        const etiquetaMasCaro = esMasCaro ? ' <span class="badge bg-danger">Pedido más caro</span>' : '';

        filasTabla += `
            <tr class="${filaClass}">
                <td>${p.nombre}${etiquetaMasCaro}</td>
                <td>${p.tamano}</td>
                <td>${ingredientesTexto}</td>
                <td>$${p.precioUnitario.toLocaleString('es-CL')}</td>
                <td>${p.cantidad}</td>
                <td>$${p.totalPedido.toLocaleString('es-CL')}</td>
            </tr>
        `;
    });

    if (pedidos.length === 0) {
        filasTabla = `<tr><td colspan="6" class="text-center">No hay pedidos registrados aún.</td></tr>`;
    }

    const pedidoMayorTexto = pedidoMasCaro
        ? `${pedidoMasCaro.nombre} - ${pedidoMasCaro.tamano} - ${pedidoMasCaro.cantidad} unidad(es) - $${pedidoMasCaro.totalPedido.toLocaleString('es-CL')}`
        : 'Aún no hay pedidos registrados.';

    const htmlResponse = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lista de Pedidos - Pizzería Don Node</title>
        <link rel="stylesheet" href="/stylesheet.css">
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-danger">
            <div class="container">
                <a class="navbar-brand" href="/">Pizzería Don Node</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item"><a class="nav-link" href="/">Nuevo pedido</a></li>
                        <li class="nav-item"><a class="nav-link active" aria-current="page" href="/pedidos">Lista de pedidos</a></li>
                    </ul>
                </div>
            </div>
        </nav>

        <main class="container py-5">
            <div class="row gy-4">
                <div class="col-12">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h1 class="h4 mb-3">Pedidos registrados</h1>
                            <p class="mb-0 text-muted">Total acumulado: <strong>$${totalAcumulado.toLocaleString('es-CL')}</strong></p>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-lg-8">
                    <div class="card shadow-sm">
                        <div class="card-header">
                            <h2 class="h5 mb-0">Detalle de pedidos</h2>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover align-middle mb-0">
                                    <thead class="table-dark">
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
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-lg-4">
                    <div class="card border-danger shadow-sm">
                        <div class="card-header bg-danger text-white">
                            <h2 class="h6 mb-0">Pedido más caro</h2>
                        </div>
                        <div class="card-body">
                            <p class="mb-0">${pedidoMayorTexto}</p>
                        </div>
                    </div>
                    <div class="mt-4 text-center">
                        <a href="/" class="btn btn-outline-danger w-100">Volver al formulario</a>
                    </div>
                </div>
            </div>
        </main>

        <script src="/bootstrap.bundle.min.js"></script>
    </body>
    </html>
    `;

    res.send(htmlResponse);
};