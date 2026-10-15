# SHADE

> Disfruta del camino, no solo del destino.

SHADE es un prototipo de app para personas que salen a correr o caminar por la ciudad y quieren rutas más **saludables, cómodas y agradables**. Recomienda recorridos según tres factores:

- **Sombra:** porcentaje de la ruta bajo arbolado.
- **Calidad del aire:** lejos del tráfico y la contaminación.
- **Ruido:** menos contaminación acústica.

El prototipo usa **Madrid** como ciudad de ejemplo, con rutas y datos ambientales **simulados** (no usa GPS ni sensores reales).

## Qué hace

1. **Pantalla de inicio:** eliges correr o caminar, la distancia (3, 5, 10 km o personalizada) y qué priorizar: más sombra, mejor aire, menos ruido o equilibrado. El botón **Sorpréndeme** propone una combinación distinta.
2. **Rutas:** mapa interactivo con tres alternativas de colores y una tarjeta por ruta (distancia, duración, sombra, aire, ruido y puntuación saludable de 0 a 100). La app destaca la que mejor encaja con tu prioridad.
3. **Detalle:** mapa ampliado, características ambientales y una explicación de por qué se recomienda. **Comenzar ruta** simula el recorrido con progreso, distancia y mensajes sobre las condiciones; al terminar aparece una felicitación.
4. **Demo de Juan:** un recorrido guiado de unos 25 segundos. Juan, de 20 años, siempre corre junto a una carretera con mucho tráfico y usa SHADE para encontrar una ruta de 5 km con más sombra y menos ruido.

## Cómo se puntúa una ruta

Cada ruta tiene tres valores de 0 a 100 (sombra, aire y silencio). La puntuación saludable es una media ponderada según la prioridad elegida:

| Prioridad    | Sombra | Aire | Silencio |
|--------------|:------:|:----:|:--------:|
| Más sombra   | 60 %   | 20 % | 20 %     |
| Mejor aire   | 20 %   | 60 % | 20 %     |
| Menos ruido  | 20 %   | 20 % | 60 %     |
| Equilibrado  | 34 %   | 33 % | 33 %     |

La ruta con mayor puntuación se marca como «Mejor para ti».

## Tecnologías

- [React](https://react.dev) + [Vite](https://vite.dev)
- [Leaflet](https://leafletjs.com) y [react-leaflet](https://react-leaflet.js.org) con mapas de [OpenStreetMap](https://www.openstreetmap.org)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) para poder instalarla como app

## Instalación

Necesitas [Node.js](https://nodejs.org) 20 o superior.

```bash
git clone https://github.com/PePin22/Shade.git
cd Shade
npm install
npm run dev
```

Abre http://localhost:5173/ en el navegador.

### Probarla en el móvil

Con el móvil y el ordenador en la misma red wifi:

```bash
npm run dev -- --host
```

Abre en el móvil la dirección que aparece en la línea `Network:`.

### Compilar para publicar

```bash
npm run build
```

Genera la carpeta `dist`, lista para subir a Vercel, Netlify o cualquier alojamiento estático. Para que el navegador ofrezca instalarla como app, la web debe servirse con `https`.

## Estructura

```
shade/
├── public/icon.svg     Icono de la app
├── src/App.jsx         Pantallas, lógica de puntuación y demo
├── src/index.css       Estilos
├── vite.config.js      Configuración de Vite y de la PWA
└── package.json
```

## Limitaciones

- Los datos de sombra, calidad del aire y ruido son **ficticios**, aunque coherentes entre sí.
- Los trazados del mapa son aproximados y no siguen calles exactas.
- No hay registro de usuarios, base de datos ni GPS real.
- El mapa necesita conexión a internet para cargar los tiles de OpenStreetMap.

## Ideas para el futuro

- GPS real para seguir el recorrido en tiempo real.
- Datos reales de calidad del aire, ruido y arbolado.
- Rutas generadas a partir de la ubicación del usuario.
- Más ciudades.

## Créditos

Mapas © [colaboradores de OpenStreetMap](https://www.openstreetmap.org/copyright).

Autor: Jose Villalba Adánez ([@PePin22](https://github.com/PePin22))
