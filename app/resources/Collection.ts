import type CollectionFilm from "~/resources/CollectionFilm";

export default interface Collection {
    id: number;
    name: string;
    films_count?: number;
    films?: CollectionFilm[];
    can_edit?: boolean;
}
