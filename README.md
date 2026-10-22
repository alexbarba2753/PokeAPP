# Laboratorio: Consumo de APIs con Ionic - PokeAPI

Aplicación móvil desarrollada en **Ionic** y **Angular** para consultar la API de Pokémon ([PokeAPI](https://pokeapi.co/)), ver detalles, escuchar sus sonidos, ver imágenes/GIFs y comparar dos Pokémon.

---

## 📌 Requisitos Realizados

### Nivel 1
- Buscador de Pokémon por nombre, ID (#025) y filtro por tipo.
- Muestra los detalles de cada Pokémon (foto, tipos, altura, peso, habilidades y estadísticas base).
- Interfaz limpia y agradable visualmente.

### Nivel 2
- Reproducción del sonido oficial (grito) del Pokémon.
- Galería con más de 5 imágenes (sprites de frente, espalda, versiones shiny variocolor y render oficial).
- Visualización de sprite animado en formato GIF.

### Nivel 3
- Comparador entre 2 Pokémon cara a cara.
- Comparación de estadísticas base (HP, ataque, defensa, velocidad, etc.) indicando cuál gana en cada una y el total.

---

## 📱 Capturas de Pantalla (Probado en Celular)

### Nivel 1: Buscador y Lista de Pokémon
<p align="center">
  <img width="280" alt="Pantalla Principal" src="screenshots/01_nivel1_pokedex_grid.png" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img width="280" alt="Buscador por tipo y nombre" src="screenshots/02_nivel1_filtro_buscador.png" />
</p>

### Nivel 1: Detalles del Personaje
<p align="center">
  <img width="280" alt="Detalles del Pokémon" src="screenshots/03_nivel1_detalles_estadisticas.png" />
</p>

### Nivel 2: Sonido (Grito), GIF Animado y Galería de Imágenes
<p align="center">
  <img width="280" alt="Sonido y GIF" src="screenshots/04_nivel2_reproductor_grito_gif.png" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img width="280" alt="Galería de Sprites" src="screenshots/05_nivel2_galeria_multimedia.png" />
</p>

### Nivel 3: Comparador de 2 Pokémon
<p align="center">
  <img width="280" alt="Comparador Arena VS" src="screenshots/06_nivel3_comparador_arena_vs.png" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img width="280" alt="Comparativa de Estadísticas" src="screenshots/07_nivel3_comparador_estadisticas.png" />
</p>

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/alexbarba2753/PokeAPP.git
cd PokeAPP
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Probar en la PC
```bash
ionic serve
```

### 4. Probar en el Celular (misma red Wi-Fi)
1. Conectar la PC y el teléfono a la misma red Wi-Fi.
2. Ejecutar:
   ```bash
   ionic serve --host=0.0.0.0
   ```
3. Abrir el navegador del celular e ingresar a la dirección IP que muestra la consola (por ejemplo: `http://192.168.1.15:8100`).

---

## 🛠️ Tecnologías Utilizadas
- **Ionic Framework**
- **Angular**
- **Capacitor**
- **PokeAPI** (`https://pokeapi.co/api/v2/`)
