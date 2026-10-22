import { Component, OnInit, OnDestroy } from '@angular/core';
import { PokemonService } from 'src/app/services/pokemon.service';

export interface GalleryItem {
  label: string;
  url: string;
  format: 'PNG' | 'GIF' | 'WEBP' | 'SVG';
  isShiny?: boolean;
}

export interface TypeFilter {
  name: string;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.page.html',
  styleUrls: ['./pokemon-list.page.scss'],
})
export class PokemonListPage implements OnInit, OnDestroy {
  // Lista de Pokémon
  pokemons: any[] = [];
  filteredPokemons: any[] = [];
  loading = false;
  searchRemoteLoading = false;
  viewMode: 'grid' | 'list' = 'grid';

  // Filtros
  searchTerm: string = '';
  selectedTypeFilter: string = 'all';
  availableTypes: TypeFilter[] = [
    { name: 'all', label: 'Todos', icon: 'apps-outline', color: 'medium' },
    { name: 'fire', label: 'Fuego', icon: 'flame', color: 'danger' },
    { name: 'water', label: 'Agua', icon: 'water', color: 'primary' },
    { name: 'grass', label: 'Planta', icon: 'leaf', color: 'success' },
    { name: 'electric', label: 'Eléctrico', icon: 'flash', color: 'warning' },
    { name: 'psychic', label: 'Psíquico', icon: 'eye', color: 'tertiary' },
    { name: 'ice', label: 'Hielo', icon: 'snow', color: 'secondary' },
    { name: 'dragon', label: 'Dragón', icon: 'sparkles', color: 'tertiary' },
    { name: 'ghost', label: 'Fantasma', icon: 'skull', color: 'dark' },
    { name: 'rock', label: 'Roca', icon: 'cube', color: 'warning' },
    { name: 'ground', label: 'Tierra', icon: 'earth', color: 'warning' },
    { name: 'poison', label: 'Veneno', icon: 'skull-outline', color: 'tertiary' },
    { name: 'bug', label: 'Bicho', icon: 'bug', color: 'success' },
    { name: 'normal', label: 'Normal', icon: 'ellipse-outline', color: 'medium' },
  ];

  // Nivel 1 & 2: Detalle, Galería y Multimedia
  selectedPokemon: any = null;
  selectedSpecies: any = null;
  isModalOpen = false;
  activeSegment: 'info' | 'gallery' | 'compare' = 'info';
  selectedGalleryImage: GalleryItem | null = null;

  // Nivel 2: Audio / Grito (Cry)
  isPlayingAudio = false;
  currentAudio: HTMLAudioElement | null = null;

  // Nivel 3: Comparador de 2 Pokémon
  comparePokemon: any = null;
  statsToCompare = [
    { key: 'hp', label: 'Puntos de Salud (HP)', icon: 'heart' },
    { key: 'attack', label: 'Ataque Físico', icon: 'barbell' },
    { key: 'defense', label: 'Defensa Física', icon: 'shield' },
    { key: 'special-attack', label: 'Ataque Especial', icon: 'flash' },
    { key: 'special-defense', label: 'Defensa Especial', icon: 'shield-checkmark' },
    { key: 'speed', label: 'Velocidad', icon: 'speedometer' },
  ];

  constructor(private pokemonService: PokemonService) {}

  ngOnInit() {
    this.fetchInitialPokemons();
  }

  ngOnDestroy() {
    this.stopAudio();
  }

  // ========================================================
  // CARGA DE DATOS INICIALES
  // ========================================================
  fetchInitialPokemons() {
    this.loading = true;
    this.pokemonService.getPokemonListWithDetails(30, 0).subscribe({
      next: (list) => {
        this.pokemons = list;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando lista de Pokémon:', err);
        this.loading = false;
      },
    });
  }

  handleRefresh(event: any) {
    this.pokemonService.getPokemonListWithDetails(30, 0).subscribe({
      next: (list) => {
        this.pokemons = list;
        this.applyFilter();
        event.target.complete();
      },
      error: (err) => {
        console.error('Error al refrescar:', err);
        event.target.complete();
      },
    });
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  // ========================================================
  // NIVEL 1: BUSCADOR Y FILTRADO
  // ========================================================
  onSearchChange(event: any) {
    this.searchTerm = (event.target.value || '').trim().toLowerCase();
    this.applyFilter();

    // Si no hay resultados locales y el usuario escribió un término con más de 2 caracteres, buscar en API
    if (this.filteredPokemons.length === 0 && this.searchTerm.length >= 2) {
      this.searchRemotePokemon(this.searchTerm);
    }
  }

  setTypeFilter(typeName: string) {
    this.selectedTypeFilter = typeName;
    this.applyFilter();
  }

  applyFilter() {
    let result = [...this.pokemons];

    // Filtro por tipo
    if (this.selectedTypeFilter !== 'all') {
      result = result.filter((p) =>
        p.types?.some((t: any) => t.type.name.toLowerCase() === this.selectedTypeFilter.toLowerCase())
      );
    }

    // Filtro por texto (Nombre o ID)
    if (this.searchTerm) {
      result = result.filter((p) => {
        const matchName = p.name.toLowerCase().includes(this.searchTerm);
        const matchId = p.id.toString() === this.searchTerm;
        const matchType = p.types?.some((t: any) => t.type.name.toLowerCase().includes(this.searchTerm));
        return matchName || matchId || matchType;
      });
    }

    this.filteredPokemons = result;
  }

  searchRemotePokemon(nameOrId: string) {
    this.searchRemoteLoading = true;
    this.pokemonService.getPokemonDetails(nameOrId).subscribe({
      next: (pokemon) => {
        this.searchRemoteLoading = false;
        if (pokemon && !this.pokemons.some((p) => p.id === pokemon.id)) {
          this.pokemons.unshift(pokemon);
          this.applyFilter();
        }
      },
      error: () => {
        this.searchRemoteLoading = false;
      },
    });
  }

  // ========================================================
  // NIVEL 1: DETALLES Y MODAL
  // ========================================================
  openDetails(pokemon: any) {
    this.selectedPokemon = pokemon;
    this.activeSegment = 'info';
    this.isModalOpen = true;

    // Inicializar imagen seleccionada de la galería
    const gallery = this.getPokemonGallery(pokemon);
    this.selectedGalleryImage = gallery.length > 0 ? gallery[0] : null;

    // Obtener rival por defecto para el comparador
    const defaultRival = this.pokemons.find((p) => p.id !== pokemon.id);
    this.comparePokemon = defaultRival || null;

    // Cargar descripción de especie
    this.pokemonService.getPokemonSpecies(pokemon.id).subscribe((species) => {
      this.selectedSpecies = species;
    });
  }

  closeDetails() {
    this.stopAudio();
    this.isModalOpen = false;
    this.selectedPokemon = null;
    this.selectedSpecies = null;
  }

  getPokemonDescription(): string {
    if (!this.selectedSpecies?.flavor_text_entries) return '';
    // Buscar descripción en español primero, luego en inglés
    const entryEs = this.selectedSpecies.flavor_text_entries.find(
      (entry: any) => entry.language.name === 'es'
    );
    if (entryEs) {
      return entryEs.flavor_text.replace(/[\n\f\r]/g, ' ');
    }
    const entryEn = this.selectedSpecies.flavor_text_entries.find(
      (entry: any) => entry.language.name === 'en'
    );
    return entryEn ? entryEn.flavor_text.replace(/[\n\f\r]/g, ' ') : '';
  }

  // ========================================================
  // NIVEL 2: REPRODUCIR SONIDO (CRY)
  // ========================================================
  playCry(pokemon: any) {
    if (!pokemon) return;

    this.stopAudio();

    // PokeAPI cries: versión moderna o fallback
    const audioUrl =
      pokemon.cries?.latest ||
      pokemon.cries?.legacy ||
      `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;

    try {
      this.isPlayingAudio = true;
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = 0.7;

      this.currentAudio.onended = () => {
        this.isPlayingAudio = false;
      };

      this.currentAudio.onerror = (e) => {
        console.warn('Error al reproducir audio de grito:', e);
        this.isPlayingAudio = false;
      };

      this.currentAudio.play().catch((err) => {
        console.warn('El navegador bloqueó o no pudo reproducir el audio:', err);
        this.isPlayingAudio = false;
      });
    } catch (err) {
      console.warn('Error instanciando Audio:', err);
      this.isPlayingAudio = false;
    }
  }

  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlayingAudio = false;
  }

  // ========================================================
  // NIVEL 2: GALERÍA DE MÁS DE 5 IMÁGENES Y GIF ANIMADO
  // ========================================================
  getPokemonImage(pokemon: any): string {
    return (
      pokemon?.sprites?.other?.['official-artwork']?.front_default ||
      pokemon?.sprites?.other?.home?.front_default ||
      pokemon?.sprites?.front_default ||
      ''
    );
  }

  getAnimatedSprite(pokemon: any): string {
    return (
      pokemon?.sprites?.other?.showdown?.front_default ||
      pokemon?.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
      ''
    );
  }

  getPokemonGallery(pokemon: any): GalleryItem[] {
    if (!pokemon?.sprites) return [];
    const items: GalleryItem[] = [];

    // 1. Arte Oficial HD (PNG)
    if (pokemon.sprites.other?.['official-artwork']?.front_default) {
      items.push({
        label: 'Arte Oficial HD',
        url: pokemon.sprites.other['official-artwork'].front_default,
        format: 'PNG',
      });
    }

    // 2. Sprite Animado en Batalla Showdown (GIF)
    const showdownGif = this.getAnimatedSprite(pokemon);
    if (showdownGif) {
      items.push({
        label: 'Sprite Animado Batalla',
        url: showdownGif,
        format: 'GIF',
      });
    }

    // 3. Render Pokémon HOME HD
    if (pokemon.sprites.other?.home?.front_default) {
      items.push({
        label: 'Render Pokémon HOME',
        url: pokemon.sprites.other.home.front_default,
        format: 'PNG',
      });
    }

    // 4. Sprite Frente Clásico
    if (pokemon.sprites.front_default) {
      items.push({
        label: 'Frente Clásico',
        url: pokemon.sprites.front_default,
        format: 'PNG',
      });
    }

    // 5. Sprite Espalda Clásico
    if (pokemon.sprites.back_default) {
      items.push({
        label: 'Espalda Clásico',
        url: pokemon.sprites.back_default,
        format: 'PNG',
      });
    }

    // 6. Sprite Frente Shiny ✨
    if (pokemon.sprites.front_shiny) {
      items.push({
        label: 'Frente Shiny ✨',
        url: pokemon.sprites.front_shiny,
        format: 'PNG',
        isShiny: true,
      });
    }

    // 7. Sprite Espalda Shiny ✨
    if (pokemon.sprites.back_shiny) {
      items.push({
        label: 'Espalda Shiny ✨',
        url: pokemon.sprites.back_shiny,
        format: 'PNG',
        isShiny: true,
      });
    }

    // 8. Ilustración Dream World
    if (pokemon.sprites.other?.dream_world?.front_default) {
      items.push({
        label: 'Dream World',
        url: pokemon.sprites.other.dream_world.front_default,
        format: 'SVG',
      });
    }

    return items;
  }

  selectGalleryImage(item: GalleryItem) {
    this.selectedGalleryImage = item;
  }

  // ========================================================
  // NIVEL 3: COMPARADOR DE 2 PERSONAJES (ARENA VS)
  // ========================================================
  selectRival(event: any) {
    const rivalId = Number(event.detail.value);
    this.comparePokemon = this.pokemons.find((p) => p.id === rivalId) || null;
  }

  getStatValue(pokemon: any, statKey: string): number {
    if (!pokemon?.stats) return 0;
    const item = pokemon.stats.find(
      (s: any) =>
        s.stat.name.toLowerCase() === statKey.toLowerCase() ||
        s.stat.name.toLowerCase().replace('-', '') === statKey.toLowerCase().replace('-', '')
    );
    return item ? item.base_stat : 0;
  }

  getTotalStats(pokemon: any): number {
    if (!pokemon?.stats) return 0;
    return pokemon.stats.reduce((acc: number, s: any) => acc + s.base_stat, 0);
  }

  getStatWinner(statKey: string): 'p1' | 'p2' | 'tie' {
    const v1 = this.getStatValue(this.selectedPokemon, statKey);
    const v2 = this.getStatValue(this.comparePokemon, statKey);
    if (v1 > v2) return 'p1';
    if (v2 > v1) return 'p2';
    return 'tie';
  }

  getStatBalancePercent(pokemonNumber: 1 | 2, statKey: string): number {
    const v1 = this.getStatValue(this.selectedPokemon, statKey);
    const v2 = this.getStatValue(this.comparePokemon, statKey);
    const total = v1 + v2;
    if (total === 0) return 50;
    const ratio = pokemonNumber === 1 ? v1 / total : v2 / total;
    return Math.round(ratio * 100);
  }

  // ========================================================
  // ESTILOS DINÁMICOS POR TIPO DE POKÉMON
  // ========================================================
  getPrimaryType(pokemon: any): string {
    return pokemon?.types?.[0]?.type?.name?.toLowerCase() || 'normal';
  }

  getTypeGradient(pokemon: any): string {
    const type = this.getPrimaryType(pokemon);
    const gradients: Record<string, string> = {
      fire: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)',
      water: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      grass: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
      electric: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
      psychic: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
      ice: 'linear-gradient(135deg, #81ecec 0%, #00cec9 100%)',
      dragon: 'linear-gradient(135deg, #6c5ce7 0%, #341f97 100%)',
      dark: 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)',
      fairy: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
      normal: 'linear-gradient(135deg, #b2bec3 0%, #636e72 100%)',
      fighting: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)',
      flying: 'linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)',
      poison: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
      ground: 'linear-gradient(135deg, #ffeaa7 0%, #e17055 100%)',
      rock: 'linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)',
      bug: 'linear-gradient(135deg, #badc58 0%, #6ab04c 100%)',
      ghost: 'linear-gradient(135deg, #a29bfe 0%, #2d3436 100%)',
      steel: 'linear-gradient(135deg, #dfe6e9 0%, #636e72 100%)',
    };
    return gradients[type] || 'linear-gradient(135deg, #b2bec3 0%, #636e72 100%)';
  }

  getTypeColorBadge(type: string): string {
    switch (type?.toLowerCase()) {
      case 'fire':
        return 'danger';
      case 'water':
        return 'primary';
      case 'grass':
      case 'bug':
        return 'success';
      case 'electric':
        return 'warning';
      case 'psychic':
      case 'dragon':
      case 'ghost':
      case 'poison':
        return 'tertiary';
      case 'ice':
        return 'secondary';
      case 'dark':
      case 'rock':
      case 'ground':
      case 'steel':
        return 'dark';
      default:
        return 'medium';
    }
  }
}
