let precioDolar;
let coins = [];

//operador ternario para averiguar si hay contenido en el localStorage;
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//se ejecuta cuando se haya cargado todo en la pagina
window.onload=()=>{
    cargaDolarPrecio();
    mostrarCarrito();
};

function cargarCoins() {
    //se visibilizan el array en el Dom
    coins.map(coin => {
        //valido si el mercado del dia esta en alza o baja de cada moneda
        let coinChangeNumber = Number(coin.change);
        let coinchangeIcon = coinChangeNumber >= 0 ? 'up.png' : 'down.png';
        let coinchangecolor = coinChangeNumber >= 0 ? '#36BD94' : '#DB2304';

        //imprimo en dom las monedas con sus repectivos valores
        template = document.getElementById("laDataWacho");
        template.innerHTML += `
        <div class="contenidotabla">
            <div class="col-md-4 tabla-responsive">
                <div class="row flexbox-header">
                    <div class="col-md-2 tabla-responsive">
                        <img src="${coin.iconUrl}" alt="" class="img-fluid img-icon-responsive">
                    </div>
                    <div class="col-md-10 datos-moneda tabla-responsive">
                        <b>${coin.name}</b> <br>
                        <b>Precio = </b><span>${Number(coin.price).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</span>
                    </div>
                </div>
            </div>
            <div class="col-md-3 flexChange tabla-responsive">
               <span class="me-2"><img src="img/${coinchangeIcon}" alt=""></span><span style="color: ${coinchangecolor};">${coin.change}</span>
            </div>
            <div class="col-md-3 tabla-responsive market-responsive">
                $${Number(coin.marketCap).toLocaleString("en-US")}
            </div>
            <div class="col-md-2 tabla-responsive">
                <button class="btn-data-comprar" id="btn${coin.uuid}">Comprar</button>
            </div>
        </div>
        `;
    })
    //evento que capta click en el boton "comprar" y asi abrir un modal
    coins.forEach(coin => {
        let btnCompra = document.getElementById(`btn${coin.uuid}`);

        btnCompra.addEventListener('click', function() {
            cargarModal(coin);
        });
    })
}

//funcion que muestra el modal de calculadora
function cargarModal(coin) {
    
    //le agrego estilo de css para poder visualizar el modal oculto
    let abierto = document.getElementById("modalParaCambio");
    abierto.style.display = "flex";
    let formModal = document.getElementById("contenedorForm");
    //parseo a numero argentino "es_AR"
    let precioEnArs = precioDolar * Number(coin.price);
    precioEnArs = precioEnArs.toLocaleString("es-AR")
    formModal.innerHTML = `
        <div class="valor-pesos-modal">1 ${coin.symbol} ≈ ${precioEnArs} ARS</div>
        <div class="row back-input-modal">
            <div class="col-2 text-center">
                <img src="${coin.iconUrl}" alt="" class="img-fluid">
            </div>
            <div class="col-10">
                <div class="text-small-modal">cantidad de ${coin.name} a comprar</div>
                <input type="number" placeholder="Por favor ingresa la cantidad" class="input-modal" id="cantidad">
                <small id="validarInput">Ingresa cantidad para poder continuar.</small>
            </div>
        </div>
        <div class="col-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
            </svg>
        </div>
        <div class="row back-input-modal">
            <div class="col-2 text-center">
                <img src="img/ARS.png" alt="" class="img-fluid" width="50">
            </div>
            <div class="col-10">
                <div class="text-small-modal">Valor en pesos Argentinos a pagar</div>
                <p id="valor" class="valor-modal">0.00</p>
            </div>
        </div>
        <div class="col-12 text-center pt-3">
            <button type="button" class="btn-comprar-modal" id="btnComprar">COMPRAR</button>
        </div>
    `;
    //evento para captor valor del input "cantidad"
    let cantidad = document.getElementById("cantidad");
    let valor = document.getElementById("valor");
    let multiploTotal;
    cantidad.addEventListener('input', function(e) {

        //multiplico la cantidad del input por el valor de la moneda
        let multiploCantidad = e.srcElement.value * Number(coin.price);

        //multiplico por el valor actual del dolar en argentina por el multiplo anterior
        multiploTotal = multiploCantidad * precioDolar;

        //muestro el valor a pagar en pesos argentinos en la etiqueta p
        valor.innerText = multiploTotal.toLocaleString("es-AR", {minimumFractionDigits: 2, maximumFractionDigits: 2});
       
        //le agrego un atributo data para poder recopilar ese dato en mi carrito.
        valor.setAttribute("data-number", multiploTotal);
    });
    
    //evento para captar click en boton "COMPRAR"
    let btnComprarModal = document.getElementById("btnComprar");
    btnComprarModal.addEventListener('click', function() {

        //ejecuto validacion del campo cantidad para poder continuar
        if(cantidad.value == '') {
            document.getElementById("validarInput").style.display = "block";
        }else if(valor.dataset.number != multiploTotal) {  //ejecuto validacion si tratan de cambiar los datos del "data-numer" por consola
            //ejecuto la funcion de alertas, en este caso Error
            alertas("error");
        }else {
            //creo un objeto con datos que necesito de la moneda mas resultados de la calculadora
            let objetosAOtraFuncion = {
                ...coin,
                cantidadCoin: cantidad.value,
                precioCoin: valor.dataset.number,
            }
            cargarCarrito(objetosAOtraFuncion);
        }
    })
}

//creo constructor para poder guardar en mi array de carrito solo con datos que necesito
class carritoItems {
    constructor(objItems) {
        this.id = objItems.uuid;
        this.nombre = objItems.name;
        this.simbolo = objItems.symbol;
        this.icono = objItems.iconUrl;
        this.cantidad = objItems.cantidadCoin;
        this.precio = objItems.precioCoin;
    }
}
//funcion parra cargar items al carrito y tambien al storage.
function cargarCarrito(data) {
    let repetido = carrito.find(c => c.id == data.uuid); //pregunto si el el objeto ya esta agregado a mi array
    if(repetido == undefined) {
        let cargarItem = new carritoItems(data)
        carrito.push(cargarItem);
        //conviero el precio en pesos argentinos
        let precioArs = Number(cargarItem.precio).toLocaleString("es-AR", {minimumFractionDigits: 2, maximumFractionDigits: 2})
        //agregar en dom cada bloque de item
        document.getElementById("itemsCarrito").innerHTML += `
            <div class="carrito-item" id="fila${cargarItem.id}">
                <div class="col-2 text-center">
                    <img src="${cargarItem.icono}" alt="" class="img-fluid">
                </div>
                <div class="col-8 item-carrito-detalles">
                    <h3 class="m-0">${cargarItem.nombre}</h3>
                    <p class="m-0"><span id="cantidadCarrito${cargarItem.id}">${cargarItem.cantidad}</span> ${cargarItem.simbolo} ≈ <span id="precioCarrito${cargarItem.id}">$${precioArs} ARS.</span></p>
                </div>
                <div class="col-2 text-center">
                    <span class="btn-eliminar-item-carrito" id="eliminar${cargarItem.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </span>
                </div>
            </div>
        `;

        //guardo datos de mi carrito en el localStorage
        localStorage.setItem("carrito", JSON.stringify(carrito));

        //ejecuto evento para poder eliminar item del carrito.
        carrito.forEach(items => {
            document.getElementById(`eliminar${items.id}`).addEventListener ('click', function() {
                eliminarItem(items.id);
            })
        });

        //actualizo numero de cantidad de items en el carrito
        let cantidadDeitems = document.getElementById("cantidadDeItems");
        cantidadDeitems.innerText = carrito.length;

        //se actualiza subtotal
        document.getElementById("subtotal").innerText = `$${sumaTotal()} ARS`;

        //ejecuto la funcion de alertas, en este caso Éxito
        alertas("exito");
    }else {
        //le agrego estilo de css para poder visualizar el modal de alertas
        let abierto = document.getElementById("modalParaAlertas");
        abierto.style.display = "flex";

        //le agrego estilo de css para cerrar el modal de calculadora
        let cerrar = document.getElementById("modalParaCambio");
        cerrar.style.display = "none";

        document.getElementById("carritoExito").innerHTML = `
            <span style="color: #FFC009;">
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" class="bi bi-exclamation-octagon-fill" viewBox="0 0 16 16">
                    <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
            </span>
            <h2>¡Esta Moneda ya se encuentra en el carrito!</h2>
            <p>Si desea podemos reemplazar los valores actuales por este nuevo.</p>
            <div class="col-12">
                <div class="row">
                    <div class="col-6">
                        <button type="button" class="btn-comprar-modal" id="btnAceptar" style="background: #36BD94;">Aceptar</button>
                    </div>
                    <div class="col-6">
                        <button type="button" class="btn-comprar-modal" id="btnCerrar" style="background: #DB2304;">Cancelar</button>
                    </div>
                </div>
            </div>
        `;

        //detectamos el click en el boton Aceptar
        document.getElementById("btnAceptar").addEventListener('click', function() {
            let posicion = carrito.findIndex(p => p.id == data.uuid); //calculo la posición del objeto.
            carrito[posicion].cantidad = data.cantidadCoin;
            carrito[posicion].precio = data.precioCoin;

            //guardo datos de mi carrito en el localStorage
            localStorage.setItem("carrito", JSON.stringify(carrito));

            //se actualiza subtotal
            document.getElementById("subtotal").innerText = `$${sumaTotal()} ARS`;

            //actualizamos valores visuales en carrito
            let precioArs = Number(carrito[posicion].precio).toLocaleString("es-AR", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            document.getElementById("cantidadCarrito"+data.uuid).innerText = carrito[posicion].cantidad;
            document.getElementById("precioCarrito"+data.uuid).innerHTML = `$${precioArs} ARS.`;

            //ejecuto la funcion de alertas, en este caso Éxito
            alertas("exito");
        });

        //detectamos el click en el boton cancelar
        document.getElementById("btnCerrar").addEventListener('click', function() {
            //le agrego estilo de css para poder ocultar modal de alertas
            let abierto = document.getElementById("modalParaAlertas");
            abierto.style.display = "none";
        })
    }
}

//funcion para poder visualizar el carrito en el Dom
function mostrarCarrito() {

    let cantidadDeitems = document.getElementById("cantidadDeItems");
    cantidadDeitems.innerText = carrito.length;
    carrito.map(item => {
        let precioArs = Number(item.precio).toLocaleString("es-AR", {minimumFractionDigits: 2, maximumFractionDigits: 2})
        document.getElementById("itemsCarrito").innerHTML += `
        <div class="carrito-item" id="fila${item.id}">
            <div class="col-2 text-center">
                <img src="${item.icono}" alt="" class="img-fluid">
            </div>
            <div class="col-8 item-carrito-detalles">
                <h3 class="m-0">${item.nombre}</h3>
                <p class="m-0"><span id="cantidadCarrito${item.id}">${item.cantidad}</span> ${item.simbolo} ≈ <span id="precioCarrito${item.id}">$${precioArs} ARS.</span></p>
            </div>
            <div class="col-2 text-center">
                <span class="btn-eliminar-item-carrito" id="eliminar${item.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </span>
            </div>
        </div>
         `;
    });

    //ejecuto evento para poder eliminar item del carrito.
    carrito.forEach(items => {
        document.getElementById(`eliminar${items.id}`).addEventListener ('click', function() {
            eliminarItem(items.id);
        })
    });

    //se actualiza subtotal
    document.getElementById("subtotal").innerText = `$${sumaTotal()} ARS`;

}
//funcion para poder eliminar item de carrito.
function eliminarItem(id) {
    let indiceObjeto = carrito.findIndex(e => e.id == id); //encuentro posición de elemento a eliminar
    carrito.splice(indiceObjeto, 1); //elimino el objeto indicando el indice y que solo borre 1 despues de eso
    let filaElemento = document.getElementById(`fila${id}`);
    document.getElementById("itemsCarrito").removeChild(filaElemento); //elimino la fila en dom

    //elimino el objeto del localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));

    //actualizo numero de cantidad de items en el carrito
    let cantidadDeitems = document.getElementById("cantidadDeItems");
    cantidadDeitems.innerText = carrito.length;
    
    //se actualiza subtotal
    document.getElementById("subtotal").innerText = `$${sumaTotal()} ARS`;
}

//funcion para sumar todo el carrito
function sumaTotal() {
    let suma = 0;

    for (sumaItem of carrito) {
        let precioANumero = Number(sumaItem.precio)
        suma = suma + (1 * precioANumero);
    }
    return suma.toLocaleString("es-AR", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

//funcion para finalizar compra
function finalizarCompra() {

    //vacio todo el localStorage
    localStorage.clear();

    //elimino todas las filas del carrito en dom.
    carrito.map(finalizar => {
        let filaElemento = document.getElementById(`fila${finalizar.id}`);
        document.getElementById("itemsCarrito").removeChild(filaElemento); //elimino la fila en dom
    });
    
    //vacio todo el array de carrito
    carrito.length = 0;

    //actualizo numero de cantidad de items en el carrito
    let cantidadDeitems = document.getElementById("cantidadDeItems");
    cantidadDeitems.innerText = carrito.length;

    //se actualiza subtotal
    document.getElementById("subtotal").innerText = `$${sumaTotal()} ARS`;

    //se ejecuta alerta de finalizar
    alertas("finalizar");
}

//funcion para mostrar los mensajes de éxito o error
function alertas(alertas) {
    //le agrego estilo de css para poder visualizar el modal de alertas
    let abierto = document.getElementById("modalParaAlertas");
    abierto.style.display = "flex";

    //le agrego estilo de css para cerrar el modal de calculadora
    let cerrar = document.getElementById("modalParaCambio");
    cerrar.style.display = "none";

    if(alertas == "exito"){
        document.getElementById("carritoExito").innerHTML = `
            <span style="color:#36BD94;">
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" class="bi bi-cart-check-fill" viewBox="0 0 16 16">
                    <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1.646-7.646-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708z"/>
                </svg>
            </span>
            <h2>¡Tu moneda se agrego con éxito al carrito!</h2>
            <button type="button" class="btn-comprar-modal" id="btnCerrar">Aceptar</button>
        `;
        //detectamos el click en el boton aceptar
        document.getElementById("btnCerrar").addEventListener('click', function() {
            //le agrego estilo de css para poder ocultar modal de alertas
            let abierto = document.getElementById("modalParaAlertas");
            abierto.style.display = "none";
        })
    }
    if(alertas == "error"){
        document.getElementById("carritoExito").innerHTML = `
            <span style="color: #DB2304;">
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" class="bi bi-exclamation-octagon-fill" viewBox="0 0 16 16">
                    <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
            </span>
            <h2>¡Ocurrio un error!</h2>
            <p>Por favor intente nuevamente mas tarde.</p>
            <button type="button" class="btn-comprar-modal" id="btnCerrar">Aceptar</button>
        `;
        //detectamos el click en el boton aceptar
        document.getElementById("btnCerrar").addEventListener('click', function() {
            //le agrego estilo de css para poder ocultar modal de alertas
            let abierto = document.getElementById("modalParaAlertas");
            abierto.style.display = "none";
        })
    }
    if(alertas == "finalizar"){
        document.getElementById("carritoExito").innerHTML = `
            <span style="color:#36BD94;">
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" class="bi bi-cart-fill" viewBox="0 0 16 16">
                    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
            </span>
            <h2>¡Su Compra se realizo con éxito!</h2>
            <p>Muchas gracias por confiar en CryptoRoy.</p>
            <button type="button" class="btn-comprar-modal" id="btnCerrar">Aceptar</button>
        `;
        //detectamos el click en el boton aceptar
        document.getElementById("btnCerrar").addEventListener('click', function() {
            //le agrego estilo de css para poder ocultar modal de alertas
            let abierto = document.getElementById("modalParaAlertas");
            abierto.style.display = "none";
        })
    }
    
}
//cargo api sobre criptomonedas
async function cargarFetch() {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f19a3dadc3mshed47e963283b979p1319bajsn2f972f52df59',
            'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
        }
    };
        
    fetch('https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers%5B0%5D=1&orderBy=marketCap&orderDirection=desc&limit=20&offset=0', options)
        .then(response => response.json())
        .then(response => {
           coins = response.data.coins;
           cargarCoins()
        })
        .catch(err => console.error(err));
}
//cargo api sobre el precio de venta del dolar Crypto en argentina.
async function cargaDolarPrecio() {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f19a3dadc3mshed47e963283b979p1319bajsn2f972f52df59',
            'X-RapidAPI-Host': 'cotizacion-de-la-moneda.p.rapidapi.com'
        }
    };
    fetch('https://cotizacion-de-la-moneda.p.rapidapi.com/v1/argentina', options)
        .then(response => response.json())
        .then(response => {
            precioDolar = parseInt(response[0].sell);
            cargarFetch();
            console.log(response[0].sell)
        })
        .catch(err => console.error(err));
}


//libreria Jquery
$(document).ready(function(){
    //ejecutamos animacion al esperar a que se carguen todos los elemntos de la pagina
    $(window).on('load', function(){
        $('.preLoader').fadeOut(1000);
    });
    //capto scroll para cambiar de color mi header
    $(window).scroll(function(e) {
        let scrollTop = $(window).scrollTop();
        
        if(scrollTop >= 50){
            $("header").addClass("header");
        }
        
        if(scrollTop < 50){
            $("header").removeClass("header");
        }
    });
    //capto click en span cerrar para poder cerrar el modal.
     $(".cerrarModal, .cerrarModales, #btnCerrar").on( "click", function() {
        $('#modalParaCambio, #modalParaAlertas, .modalParaPerfil').hide();
     });
    
    //capto click para abrir modal de perfil
    $(".perfil").on("click", function() {
        $(".modalParaPerfil").css("display", "flex");
    });
    //capto click en el icono de carrito para poder abrir el div flotante
    $(".carrito").click(function () {
        $(".carrito-content").slideUp();
    });
    $(".carrito").on("click", function(e) {
        $(".carrito-content").show();
        if (carrito.length <= 0) {
            $(".carritoVacio").show();
            $(".carritoBox").hide();
        } else {
            $(".carritoVacio").hide();
            $(".carritoBox").show();
        }
        e.stopPropagation();
    });
    //ocultamos carrito al hacer click en cualquier parte de la pagina
    $(document).click(function(){
        $(".carrito-content").slideUp();
    });
    //anulo el hide asi no cerrar mi carrito si hago click adentro de la misma
    $(".carrito-content").click(function(e){
        e.stopPropagation();
    });
    //detectamos click en el boton "finalizar compra"
    $(".btn-finalizar-comprarl").on("click", function(){
        finalizarCompra();
    });
    //libreria de carousel owl
    $('.owl-carousel').owlCarousel({
        loop:true,
        margin:10,
        nav:true,
        responsive:{
            0:{
                items:1
            },
            768:{
                items:2
            },
            1000:{
                items:3
            }
        }
    })
});