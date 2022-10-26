
let cliente = {
    mesa: '',
    hora: '',
    pedido: [],
}

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres',
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente () {

    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    const campoVacio = [ mesa, hora ].some( campo => campo === '' );

    if (campoVacio) {

        const alertaExiste = document.querySelector('div.invalid-feedback');
        if (!alertaExiste) {

            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios.';
            document.querySelector('.modal-dialog form').appendChild(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 3500);
        }

        return;
    }

    cliente = { ...cliente, mesa, hora };

    const modalForm = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalForm);
    modalBootstrap.hide();

    mostrarSecciones();

    obtenerPlatos();
}

function mostrarSecciones () {
    const secciones = document.querySelectorAll('.d-none');
    secciones.forEach( seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatos () {

    const url = 'http://localhost:3000/platos';
    
    fetch(url)
        .then( resp => resp.json() )
        .then( result => mostrarPlatos(result) )
        .catch( error => console.log(error) );
}

function mostrarPlatos(platos) {
    const divContenido = document.querySelector('#platos .contenido');
    
    platos.forEach( plato => {
        const { categoria, id, nombre, precio } = plato;

        // DIV Contenedor
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3');

        const divNombre = document.createElement('DIV');
        divNombre.classList.add('col-md-4');
        divNombre.textContent = nombre;

        const divPrecio = document.createElement('DIV');
        divPrecio.classList.add('col-md-3', 'fw-bold');
        divPrecio.textContent = `$${precio}`;

        const divCategoria = document.createElement('DIV');
        divCategoria.classList.add('col-md-3');
        divCategoria.textContent = categorias[categoria];

        // Input que va dentro del divCantidad.
        const input = document.createElement('INPUT');
        input.classList.add('form-control');
        input.type = 'number';
        input.value = 0;
        input.min = 0;
        input.id = `producto-${id}`;

        input.onchange = function () {
            const cantidad = parseInt(input.value);
            agregarPlato({...plato, cantidad});
        }

        const divCantidad = document.createElement('DIV');
        divCantidad.classList.add('col-md-2');
        divCantidad.appendChild(input);

        row.appendChild(divNombre);
        row.appendChild(divPrecio);
        row.appendChild(divCategoria);
        row.appendChild(divCantidad);
        divContenido.appendChild(row);

    })

}

function agregarPlato (producto) {

    let { pedido } = cliente;
    const resultado = pedido.filter( item => item.id !== producto.id);
   
    if (producto.cantidad > 0) {
        cliente.pedido = [...resultado, producto];
    } else {
        cliente.pedido = [...resultado];
    }

    limpiarResumen();

    if (cliente.pedido.length) {
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

}

function actualizarResumen () {

    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa; 
    mesaSpan.classList.add('fw-normal');

    const hora = document.createElement('P');
    hora.classList.add('fw-bold');
    hora.textContent = 'Hora: ';

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    const grupo = document.createElement('UL');
    grupo.classList.add('list-group')
    
    let { pedido } = cliente;
    pedido.forEach( item => {
        const { nombre, precio, cantidad, id} = item;
        
        const lista = document.createElement('LI');
        lista.classList.add('list-group-item')

        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4')
        nombreEl.textContent = nombre;

        const precioEl = document.createElement('P');
        precioEl.textContent = 'Precio: ';
        precioEl.classList.add('fw-bold');

        const precioSpanEl = document.createElement('SPAN');
        precioSpanEl.textContent = `$${precio}`;
        precioSpanEl.classList.add('fw-normal');

        const cantidadEl = document.createElement('P');
        cantidadEl.textContent = 'Cantidad: ';
        cantidadEl.classList.add('fw-bold');

        const cantidadSpanEl = document.createElement('SPAN');
        cantidadSpanEl.textContent = cantidad;
        cantidadSpanEl.classList.add('fw-normal');

        const subtotalEl = document.createElement('P');
        subtotalEl.textContent = 'Subtotal: ';
        subtotalEl.classList.add('fw-bold');

        const subtotalSpanEl = document.createElement('SPAN');
        subtotalSpanEl.textContent = `$${precio * cantidad}`;
        subtotalSpanEl.classList.add('fw-normal');

        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.onclick = () => {
            eliminarPedido(id);
        }

        precioEl.appendChild(precioSpanEl);
        cantidadEl.appendChild(cantidadSpanEl);
        subtotalEl.appendChild(subtotalSpanEl);
        lista.appendChild(nombreEl);
        lista.appendChild(precioEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        grupo.appendChild(lista);

    })

    const heading = document.createElement('H3');
    heading.textContent = 'Platos consumidos';
    heading.classList.add('my-4', 'text-center');

    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);
    formularioPropinas();

}

function limpiarResumen () {
    const contenido = document.querySelector('#resumen .contenido');

    // si contenido tiene algo, lo elimino.
    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }

}

function eliminarPedido (id) {

    let { pedido } = cliente;
    const pedidoActualizado = pedido.filter( item => item.id !== id );
    cliente.pedido = [...pedidoActualizado];

    // Limpio todo el HTML nuevamente.
    limpiarResumen();
    // Actualizo el HTML.
    if (cliente.pedido.length) {
        actualizarResumen();
    } else {
        // Si el arreglo no tiene nada.
        mensajePedidoVacio();
    }

    // Reestablezco a 0 el input correspondiente
    const productoId = `#producto-${id}`;
    const inputProducto = document.querySelector(productoId)
    inputProducto.value = 0;

}

function mensajePedidoVacio () {

    const contenido = document.querySelector('#resumen .contenido')
    const mensaje = document.createElement('P');
    mensaje.classList.add('text-center');
    mensaje.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(mensaje);
}

function formularioPropinas () {

    const contenido = document.querySelector('#resumen .contenido');

    // DIV separador
    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6');

    // DIV contenedor principal
    const formularioDiv = document.createElement('DIV');
    formularioDiv.classList.add('formulario', 'card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina; // al clickear ejecuto la función.

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label)

    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina; // al clickear ejecuto la función.

    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);


    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    const radioSin = document.createElement('INPUT');
    radioSin.type = 'radio';
    radioSin.name = 'propina';
    radioSin.value = '0';
    radioSin.classList.add('form-check-input');
    radioSin.onclick = calcularPropina;

    const radioSinLabel = document.createElement('LABEL');
    radioSinLabel.textContent = 'Sin propina';
    radioSinLabel.classList.add('form-check-label');

    const radioSinDiv = document.createElement('DIV');
    radioSinDiv.classList.add('form-check');

    radioSinDiv.appendChild(radioSin);
    radioSinDiv.appendChild(radioSinLabel);

    formularioDiv.appendChild(heading);
    formularioDiv.appendChild(radio10Div);
    formularioDiv.appendChild(radio25Div);
    formularioDiv.appendChild(radio50Div);
    formularioDiv.appendChild(radioSinDiv);

    formulario.appendChild(formularioDiv);
    contenido.appendChild(formulario);

}

function calcularPropina () {

    const { pedido } = cliente;
    let subtotal = 0;

    // Calculo el subtotal a pagar
    pedido.forEach( item => {
        subtotal += item.cantidad * item.precio;
    })

    // Selecciono el radio button correspondiente
    const propinaSelec = document.querySelector('[name="propina"]:checked').value;

    // Calculo la propina en base al subtotal
    const propina = ((subtotal * parseInt(propinaSelec)) / 100);

    // Calculo el total
    const total = propina + subtotal;

    mostrarTotal(subtotal, total, propina);

}

function mostrarTotal(subtotal, total, propina) {
    
    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar');

    // Subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fw-bold', 'mt-3');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;
    subtotalParrafo.appendChild(subtotalSpan);

    // Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fw-bold');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;
    propinaParrafo.appendChild(propinaSpan);

    // Total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fw-bold');
    totalParrafo.textContent = 'Total a Pagar: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv) {
        totalPagarDiv.remove();
    }
    
    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario');
    formulario.appendChild(divTotales);
    
}