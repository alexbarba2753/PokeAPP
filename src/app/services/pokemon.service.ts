import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

export interface PokemonSummary {
  id: number;
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly apiUrl = 'https://pokeapi.co/api/v2';
  private pokemonCache = new Map<string | number, any>();
  private speciesCache = new Map<string | number, any>();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista básica de Pokémon paginada
   */
  getPokemons(limit: number = 30, offset: number = 0): Observable<any> {
    return this.http.get<{ results: PokemonSummary[]; count: number }>(
      `${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Obtiene los detalles completos de un Pokémon por nombre o ID con caché
   */
  getPokemonDetails(nameOrId: string | number): Observable<any> {
    const key = String(nameOrId).toLowerCase().trim();
    if (this.pokemonCache.has(key)) {
      return of(this.pokemonCache.get(key));
    }

    return this.http.get<any>(`${this.apiUrl}/pokemon/${key}`).pipe(
      tap((pokemon) => {
        this.pokemonCache.set(key, pokemon);
        this.pokemonCache.set(pokemon.id, pokemon);
        this.pokemonCache.set(pokemon.name, pokemon);
      }),
      catchError((error) => {
        console.warn(`Error al consultar detalles de Pokémon '${key}':`, error);
        throw error;
      })
    );
  }

  /**
   * Obtiene información de la especie (descripción en español, hábitat, etc.)
   */
  getPokemonSpecies(nameOrId: string | number): Observable<any> {
    const key = String(nameOrId).toLowerCase().trim();
    if (this.speciesCache.has(key)) {
      return of(this.speciesCache.get(key));
    }

    return this.http.get<any>(`${this.apiUrl}/pokemon-species/${key}`).pipe(
      tap((species) => {
        this.speciesCache.set(key, species);
      }),
      catchError((err) => {
        console.warn(`No se encontró especie para ${key}:`, err);
        return of(null);
      })
    );
  }

  /**
   * Obtiene una lista de Pokémon con todos sus detalles completos
   */
  getPokemonListWithDetails(limit: number = 30, offset: number = 0): Observable<any[]> {
    return this.getPokemons(limit, offset).pipe(
      switchMap((response) => {
        const detailRequests: Observable<any>[] = response.results.map((p: any) =>
          this.getPokemonDetails(p.name).pipe(
            catchError(() => of(null))
          )
        );
        return forkJoin(detailRequests).pipe(
          map((list) => list.filter((p) => p !== null))
        );
      })
    );
  }
}
