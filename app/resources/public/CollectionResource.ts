import type FilmResource from "~/resources/public/FilmResource";
import type {CollectionVisibility} from "~/types/enums/CollectionVisibility";

export interface CollectionFilmResource {
    position: number;
    note: string | null;
    film: FilmResource;
}

export interface CollectionAuthor {
    name: string;
    public_key: string;
}

/** Карточка коллекции в списке профиля — без фильмов. */
export interface CollectionCardResource {
    id: number;
    name: string;
    description: string | null;
    public_key: string;
    visibility: CollectionVisibility;
    /** Готовый путь страницы, зависит от уровня доступа. */
    path: string;
    films_count?: number;
    updated_at: string | null;
}

export default interface CollectionResource {
    id: number;
    name: string;
    description: string | null;
    public_key: string;
    visibility: CollectionVisibility;
    /** Готовый путь страницы, зависит от уровня доступа. */
    path: string;
    author?: CollectionAuthor;
    films_count?: number;
    films: CollectionFilmResource[];
    updated_at: string | null;
}
