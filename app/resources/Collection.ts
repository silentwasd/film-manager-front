import type CollectionFilm from "~/resources/CollectionFilm";

export default interface Collection {
    id: number;
    name: string;
    description?: string | null;
    is_public?: boolean;
    public_key?: string;
    /** Приходит только у опубликованных коллекций. */
    public_url?: string;
    films_count?: number;
    films?: CollectionFilm[];
    can_edit?: boolean;
}
