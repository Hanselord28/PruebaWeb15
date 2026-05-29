const pedidos = [];

exports.guardar = (pedido) => {
    pedidos.push(pedido);
};

exports.obtenerTodos = () => {
    return [...pedidos];
};