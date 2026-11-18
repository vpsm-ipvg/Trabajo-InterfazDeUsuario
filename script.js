///// Guardar rol de los usuarios y permitir ingresar al foro
function iniciarSesion(rol) {
    localStorage.setItem('rolUsuario', rol);
    window.location.href = 'FORO ESTUDIANTES IPVG main.html';
}

///// Cambiar el tema de la pagina
document.addEventListener('DOMContentLoaded', function () {
    const formulario = document.getElementById('formCrearHilo');
    const modalCrearElemento = document.getElementById('modalCrearHilo');
    const contenedorHilos = document.getElementById('listaHilos');
    const botonTema = document.getElementById('btnCambiarTema');

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

    ///// Mostrar los hilos en la página principal

    function mostrarHilosEnMain() {
        const hilos = obtenerHilos();
        contenedorHilos.replaceChildren();

        if (hilos.length === 0) {
            contenedorHilos.appendChild(
                crearElemento('p', 'text-body-secondary', 'Todavía no hay hilos publicados. ¡Crea el primero!')
            );
            return;
        }

        hilos.forEach(function (hilo, indice) {
            const tarjeta = crearElemento('article', 'card mb-3 shadow-sm');
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

            cuerpo.append(titulo, autor, categoria, contenido, fecha, botonAbrir);
            tarjeta.appendChild(cuerpo);
            contenedorHilos.appendChild(tarjeta);
        });
    }

    ///// Abrir la ventana flotante del hilo seleccionado.
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

    //// Crear y guardar un nuevo hilo.
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

    //// Publicar una respuesta en el hilo abierto.
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
