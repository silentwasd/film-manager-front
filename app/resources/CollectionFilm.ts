import type Film from "~/resources/Film";

export default interface CollectionFilm {
    id: number;
    collection_id?: number;
    film_id?: number;
    film?: Film;
    position: number;
    note?: string | null;
}
