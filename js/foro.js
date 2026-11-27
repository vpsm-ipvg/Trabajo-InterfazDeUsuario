///// Guardar el rol y permitir entrar al foro.
function iniciarSesion(rol) {
    localStorage.setItem('rolUsuario', rol);
    window.location.href = '../index.html';
}

///// 
document.addEventListener('DOMContentLoaded', function () {
    const formulario = document.getElementById('formCrearHilo');
    const modalCrearElemento = document.getElementById('modalCrearHilo');
    const contenedorHilos = document.getElementById('listaHilos');
    const botonTema = document.getElementById('btnCambiarTema');
    const formularioBusqueda = document.getElementById('formularioBusqueda');
    const buscadorHilos = document.getElementById('buscadorHilos');
    let palabraBuscada = '';

///// Aplicar y recordar el tema elegido.
function aplicarTema(tema) {
    document.documentElement.setAttribute('data-bs-theme', tema);
    localStorage.setItem('temaForo', tema);
    if (botonTema) {
        botonTema.textContent = '◐';
        botonTema.title = tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
        botonTema.setAttribute('aria-label', botonTema.title);
        }
    }
    aplicarTema(localStorage.getItem('temaForo') || 'light');
    if (botonTema) {
        botonTema.addEventListener('click', function () {
            const actual = document.documentElement.getAttribute('data-bs-theme') || 'light';
            aplicarTema(actual === 'light' ? 'dark' : 'light');
        });
    }

///// Evitar que los elementos del main se ejecuten en el login
    if (!contenedorHilos) return;

    const modalCrear = modalCrearElemento && window.bootstrap
        ? bootstrap.Modal.getOrCreateInstance(modalCrearElemento) : null;
    const modalVerElemento = document.getElementById('modalVerHilo');
    const modalVer = modalVerElemento && window.bootstrap
        ? bootstrap.Modal.getOrCreateInstance(modalVerElemento) : null;
    const detalleHilo = document.getElementById('detalleHilo');
    const listaRespuestas = document.getElementById('listaRespuestas');
    const formularioRespuesta = document.getElementById('formResponderHilo');
    const campoRespuesta = document.getElementById('textoRespuesta');

    let indiceHiloAbierto = null;

    function obtenerHilos() {
        try {
            const datos = JSON.parse(localStorage.getItem('hilos') || '[]');
            return Array.isArray(datos) ? datos : [];
        } catch (error) {
            return [];
        }
    }

    function guardarHilos(hilos) {
        localStorage.setItem('hilos', JSON.stringify(hilos));
    }

    function crearElemento(tag, clase, texto) {
        const elemento = document.createElement(tag);
        if (clase) elemento.className = clase;
        if (texto !== undefined) elemento.textContent = texto;
        return elemento;
    }

///// Normaliza texto para que la búsqueda ignore mayúsculas y tildes
    function normalizarTexto(texto) {
        return String(texto || '')
            .toLocaleLowerCase('es')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

///// Comprobar si una palabra aparece en algún dato del hilo o sus respuestas
    function coincideConBusqueda(hilo, termino) {
        const respuestas = Array.isArray(hilo.respuestas)
            ? hilo.respuestas.map(function (respuesta) { return respuesta.texto || ''; }).join(' ')
            : '';
        const contenidoBuscable = [
            hilo.titulo, hilo.autor, hilo.categoria, hilo.contenido, respuestas
        ].join(' ');
        return normalizarTexto(contenidoBuscable).includes(termino);
    }

///// Dibuja primero los hilos que coinciden con la búsqueda y luego los demás.
    function mostrarHilosEnMain() {
        const hilos = obtenerHilos();
        contenedorHilos.replaceChildren();

        if (hilos.length === 0) {
            contenedorHilos.appendChild(
                crearElemento('p', 'text-body-secondary', 'Todavía no hay hilos publicados. ¡Crea el primero!')
            );
            return;
        }

        const termino = normalizarTexto(palabraBuscada.trim());
        const hilosOrdenados = hilos.map(function (hilo, indice) {
            return { hilo: hilo, indice: indice, coincide: termino ? coincideConBusqueda(hilo, termino) : false };
        });

        if (termino) {
            hilosOrdenados.sort(function (a, b) {
                return Number(b.coincide) - Number(a.coincide);
            });

            const cantidadCoincidencias = hilosOrdenados.filter(function (item) { return item.coincide; }).length;
            const aviso = crearElemento('p', 'text-body-secondary small mb-3',
                cantidadCoincidencias + (cantidadCoincidencias === 1
                    ? ' hilo coincide con «' + palabraBuscada.trim() + '». '
                    : ' hilos coinciden con «' + palabraBuscada.trim() + '». ')
                + 'Los resultados que tengan coincidencias con tu busqueda apareceran primero. Para eliminar los filtros, presiona la << X >> del buscador.');
            contenedorHilos.appendChild(aviso);
        }

        hilosOrdenados.forEach(function (item) {
            const hilo = item.hilo;
            const indice = item.indice;
            const tarjeta = crearElemento('article', 'card mb-3 shadow-sm' + (item.coincide ? ' border-primary' : ''));
            const cuerpo = crearElemento('div', 'card-body');
            const titulo = crearElemento('h5', 'card-title', hilo.titulo || 'Hilo sin título');
            const autor = crearElemento('small', 'text-body-secondary d-block mb-2',
                'Publicado por: ' + (hilo.autor || 'Invitado'));
            const categoria = crearElemento('span', 'badge text-bg-primary mb-2', hilo.categoria || 'General');
            const contenido = crearElemento('p', 'card-text', hilo.contenido || '');
            const fecha = crearElemento('small', 'text-body-secondary d-block mb-3', hilo.fecha || '');
            const totalRespuestas = Array.isArray(hilo.respuestas) ? hilo.respuestas.length : 0;
            const botonAbrir = crearElemento('button', 'btn btn-outline-primary btn-sm',
                'Abrir hilo y responder (' + totalRespuestas + ')');
            botonAbrir.type = 'button';
            botonAbrir.addEventListener('click', function () {
                abrirHilo(indice);
            });

            if (item.coincide) {
                const etiqueta = crearElemento('span', 'badge text-bg-success ms-2', 'Coincidencia');
                titulo.appendChild(etiqueta);
            }
            cuerpo.append(titulo, autor, categoria, contenido, fecha, botonAbrir);
            tarjeta.appendChild(cuerpo);
            contenedorHilos.appendChild(tarjeta);
        });
    }

///// La búsqueda funciona tanto con el botón como al presionar Enter.
    if (formularioBusqueda && buscadorHilos) {
        formularioBusqueda.addEventListener('submit', function (evento) {
            evento.preventDefault();
            palabraBuscada = buscadorHilos.value;
            mostrarHilosEnMain();
        });

///// Si se borra el campo, vuelve inmediatamente al orden normal.
        buscadorHilos.addEventListener('input', function () {
            if (buscadorHilos.value.trim() === '') {
                palabraBuscada = '';
                mostrarHilosEnMain();
            }
        });
    }

///// Abre la ventana flotante del hilo seleccionado.
    function abrirHilo(indice) {
        const hilos = obtenerHilos();
        const hilo = hilos[indice];
        if (!hilo || !modalVer || !detalleHilo || !listaRespuestas) return;

        indiceHiloAbierto = indice;
        detalleHilo.replaceChildren();
        detalleHilo.append(
            crearElemento('h4', 'mb-2', hilo.titulo || 'Hilo sin título'),
            crearElemento('small', 'text-body-secondary d-block mb-2',
                'Publicado por: ' + (hilo.autor || 'Invitado')),
            crearElemento('span', 'badge text-bg-primary mb-2', hilo.categoria || 'General'),
            crearElemento('p', 'mt-3', hilo.contenido || ''),
            crearElemento('small', 'text-body-secondary', hilo.fecha || '')
        );

        listaRespuestas.replaceChildren();
        const respuestas = Array.isArray(hilo.respuestas) ? hilo.respuestas : [];
        if (respuestas.length === 0) {
            listaRespuestas.appendChild(
                crearElemento('p', 'text-body-secondary', 'Aún no hay respuestas. ¡Sé la primera persona en comentar!')
            );
        } else {
            respuestas.forEach(function (respuesta) {
                const bloque = crearElemento('div', 'border rounded p-3 mb-2');
                bloque.append(
                    crearElemento('p', 'mb-1', respuesta.texto || ''),
                    crearElemento('small', 'text-body-secondary', respuesta.fecha || '')
                );
                listaRespuestas.appendChild(bloque);
            });
        }

        if (campoRespuesta) campoRespuesta.value = '';
        modalVer.show();
    }

///// Crear y guardar un nuevo hilo.
    if (formulario) {
        formulario.addEventListener('submit', function (evento) {
            evento.preventDefault();

            const autorIngresado = document.getElementById('nombreInvitadoHilo')
                ? document.getElementById('nombreInvitadoHilo').value.trim() : '';
            const autor = autorIngresado || 'Invitado';
            const titulo = document.getElementById('tituloHilo').value.trim();
            const categoria = document.getElementById('categoriaHilo').value;
            const contenido = document.getElementById('contenidoHilo').value.trim();

            if (!titulo || !contenido) {
                alert('Por favor, completa el título y el contenido del hilo.');
                return;
            }

            const hilos = obtenerHilos();
            hilos.unshift({
                titulo: titulo,
                autor: autor,
                categoria: categoria,
                contenido: contenido,
                fecha: new Date().toLocaleString('es-CL'),
                respuestas: []
            });
            guardarHilos(hilos);
            formulario.reset();
            mostrarHilosEnMain();
            if (modalCrear) modalCrear.hide();
        });
    }

///// Publicar una respuesta en el hilo abierto
    if (formularioRespuesta) {
        formularioRespuesta.addEventListener('submit', function (evento) {
            evento.preventDefault();
            const texto = campoRespuesta ? campoRespuesta.value.trim() : '';
            if (!texto || indiceHiloAbierto === null) return;

            const hilos = obtenerHilos();
            const hilo = hilos[indiceHiloAbierto];
            if (!hilo) return;

            if (!Array.isArray(hilo.respuestas)) hilo.respuestas = [];
            hilo.respuestas.push({
                texto: texto,
                fecha: new Date().toLocaleString('es-CL')
            });
            guardarHilos(hilos);
            abrirHilo(indiceHiloAbierto);
            mostrarHilosEnMain();
        });
    }

    mostrarHilosEnMain();
});
