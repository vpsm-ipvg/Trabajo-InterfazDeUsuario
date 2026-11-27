# ¿Qué es el foro IPVG?

  El foro IPVG es un foro enfocado en crear un espacio seguro que permita el ambiente saludable y colaborativo para que los alumnos del Instituto Profesional Virginio Gomez se puedan apoyar y/o comunicar entre si respecto a carreras, consejos, asignaturas, eventos, y demas. 


# Organización

| Integrantes del grupo | Cargo |
| :--- | :--- |
| Valentina Santander | Programadora |
| Thomas Villagrán | Programador principal |
| Justin Cifuentes | Project Owner |

## 🚀 Cómo ejecutar el proyecto

1. Clona este repositorio o descárgalo como `.zip`:
   ```bash
   git clone https://github.com/vpsm-ipvg/Trabajo-InterfazDeUsuario.git
   ```
2. Abre la carpeta en tu editor de código favorito (Sublime Text, Visual Studio Code, etc.)
3. Abre el archivo `index.html` en tu navegador (o usa la extensión **Live Server**).
   - También puedes servirlo con [Deno](https://deno.com) desde la carpeta del proyecto y abrir `http://localhost:8000`:
     ```bash
     deno run --allow-net --allow-read --allow-sys jsr:@std/http/file-server
     ```


# Procesos en desarrollo

### Páginas
- [x] Pagina de Log In (Invitado)
- [x] Pagina de Main 
- [ ] Bienvenida en Inicio con link "Más sobre nosotros…" (RF-05)
- [x] Página `/admins/` con administradores, contactos y formulario AdminMailbox (Título + Descripción obligatorios) (RF-05)
- [ ] AdminMailbox: guardar el mensaje y mostrar la confirmación al enviar (hoy solo recarga la página)
- [ ] Navbar y footer comunes en todas las páginas
- [x] `index.html` como página de inicio y nombres de archivo sin espacios
- [x] Eliminar `login foro 1.html` (duplicado del login)

### Funcionalidades
- [x] Crear hilo anónimo desde la navbar (RF-01)
- [x] Responder hilos (RF-03)
- [x] Buscador por palabras clave (RF-04)
- [x] Modo claro / oscuro guardado en `localStorage` (RF-06)
- [x] Mensajes de hilos y respuestas con mínimo 10 y máximo 250 caracteres (`minlength` / `maxlength`) (RF-02, RF-03)
- [ ] Validar también el largo de 10 a 250 en `js/foro.js` antes de guardar
- [ ] Botón "Responder" debajo de cada hilo, no solo dentro del modal (RF-03)
- [ ] Hilos colapsados por defecto, con triángulo `v` / `>` para ver u ocultar las respuestas
- [ ] Botón flotante circular de mensaje con `+` abajo a la izquierda para crear hilo
- [x] Campos del formulario de nuevo hilo: Edad (opcional), Pronombre (opcional) y Público (checkbox)
- [ ] Filtro por temáticas en Inicio (sin filtro, los hilos no públicos nunca se ven)
- [ ] Hilos de ejemplo en un archivo JSON propio cargados con `fetch`
- [x] Paginación de hilos con números (`| 1 | 2 | 3 | 4 |`) en vez de una sola lista hacia abajo (extra sugerido por el profe)

### Diseño y accesibilidad
- [ ] Hilos en grilla Bootstrap `row` / `col`: 1 columna en celular y 5 o más en escritorio (RNF-01)
- [ ] Login: mover el `<style>` dentro del `<head>`, corregir `color: --bg-blue` y `justify-content` / `align-items: left` (no son válidos)
- [ ] Login: reemplazar clases que no existen en Bootstrap 5 (`w-80`, `h-70`, `btns-lg`)
- [ ] IDs únicos: los dos modales usan `id="tituloModalHilo"`
- [ ] Texto `alt` en todas las imágenes (falta en el logo del login)
- [ ] Revisar contraste de colores

### Entrega
- [x] README completo: descripción, cómo ejecutarlo, integrantes y roles
- [ ] Ramas y Pull Requests con aporte de cada integrante
- [ ] Demo en vivo y defensa
