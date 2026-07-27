import type FilmResource from "~/resources/public/FilmResource";

export interface CollectionFilmResource {
    position: number;
    note: string | null;
    film: FilmResource;
}

export default interface CollectionResource {
    id: number;
    name: string;
    description: string | null;
    public_key: string;
    author?: string;
    films_count?: number;
    films: CollectionFilmResource[];
    updated_at: string | null;
}
