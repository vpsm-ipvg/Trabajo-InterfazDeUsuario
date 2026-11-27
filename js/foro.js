///// Guardar el rol y permitir entrar al foro.
function iniciarSesion(rol) {
    localStorage.setItem('rolUsuario', rol);
    window.location.href = '../index.html?bienvenida=1';
}

function contactanos(rol) {
    if (rol) localStorage.setItem('rolUsuario', rol);
    window.location.href = 'admins/index.html';
}

///// agregue la variable paginaAcTUAL LA CUAL GUARDA EL NUMERO de la pagina en la que esta actualmente el usuario
document.addEventListener('DOMContentLoaded', function () {
    const formulario = document.getElementById('formCrearHilo');
    const modalCrearElemento = document.getElementById('modalCrearHilo');
    const contenedorHilos = document.getElementById('listaHilos');
    const botonTema = document.getElementById('btnCambiarTema');
    const formularioBusqueda = document.getElementById('formularioBusqueda');
    const buscadorHilos = document.getElementById('buscadorHilos');
    let palabraBuscada = '';
    let paginaActual = 1;

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

    if (window.location.search.includes('bienvenida=1')) {
        confirm('¡Bienvenido al Foro de Estudiantes IPVG!\n\nEste es un espacio para resolver dudas académicas, compartir ideas y conversar con otros estudiantes. Puedes usar el buscador para filtrar temas o presionar "Crear hilo" para publicar.\n\n¿Deseas continuar?');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

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
        const hilosVisibles = termino
            ? hilos
            : hilos.filter(function (hilo) { return hilo.publico !== false; });

        const hilosOrdenados = hilosVisibles.map(function (hilo) {
            return { hilo: hilo, indice: hilos.indexOf(hilo), coincide: termino ? coincideConBusqueda(hilo, termino) : false };
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
            let textoAutor = 'Publicado por: ' + (hilo.autor || 'Invitado');
            if (hilo.pronombre) textoAutor += ' (' + hilo.pronombre + ')';
            if (hilo.edad) textoAutor += ' - ' + hilo.edad + ' años';
            if (hilo.publico === false) textoAutor += ' [Oculto del feed]';
            const autor = crearElemento('small', 'text-body-secondary d-block mb-2', textoAutor);
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

        ///// se supone que debe ejecutar la pagina , es algo que funciona dejenlo
        paginarHilos();
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
        let textoAutorDetalle = 'Publicado por: ' + (hilo.autor || 'Invitado');
        if (hilo.pronombre) textoAutorDetalle += ' (' + hilo.pronombre + ')';
        if (hilo.edad) textoAutorDetalle += ' - ' + hilo.edad + ' años';
        if (hilo.publico === false) textoAutorDetalle += ' [Oculto del feed]';

        detalleHilo.replaceChildren();
        detalleHilo.append(
            crearElemento('h4', 'mb-2', hilo.titulo || 'Hilo sin título'),
            crearElemento('small', 'text-body-secondary d-block mb-2', textoAutorDetalle),
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
            const edad = document.getElementById('edadHilo') ? document.getElementById('edadHilo').value.trim() : '';
            const pronombre = document.getElementById('pronombreHilo') ? document.getElementById('pronombreHilo').value.trim() : '';
            const esPublico = document.getElementById('publicoHilo') ? document.getElementById('publicoHilo').checked : true;

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
                edad: edad,
                pronombre: pronombre,
                publico: esPublico,
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

///// Aqui esta la maravilla que hace que se muestren 3 hilos por
    function paginarHilos() {
        let tarjetas = contenedorHilos.getElementsByTagName('article');
        let totalPaginas = Math.ceil(tarjetas.length / 3);

        if (paginaActual > totalPaginas) {
            paginaActual = 1;
        }

        let inicio = (paginaActual - 1) * 3;
        let fin = inicio + 3;

        for (let i = 0; i < tarjetas.length; i++) {
            if (i >= inicio && i < fin) {
                tarjetas[i].style.display = 'block';
            } else {
                tarjetas[i].style.display = 'none';
            }
        }

        let paginacion = document.getElementById('paginacionHilos');
        paginacion.innerHTML = '';

        if (totalPaginas > 1) {
            let grupo = document.createElement('div');
            grupo.className = 'btn-group';

            for (let i = 1; i <= totalPaginas; i++) {
                let boton = document.createElement('button');
                boton.type = 'button';
                boton.textContent = i;

                if (i === paginaActual) {
                    boton.className = 'btn btn-primary';
                } else {
                    boton.className = 'btn btn-outline-primary';
                }

                boton.onclick = function () {
                    paginaActual = i;
                    mostrarHilosEnMain();
                };

                grupo.appendChild(boton);
            }

            paginacion.appendChild(grupo);
        }
    }

    mostrarHilosEnMain();
});


///// Llevar a contactos
function contactanos(rol) {
    window.location.href = 'admins/index.html';
}

///// Llevar a main sin mensaje de bienvenida
function llevaramain(rol) {
    window.location.href = '../index.html';
}