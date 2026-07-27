import type CollectionFilm from "~/resources/CollectionFilm";
import type {CollectionVisibility} from "~/types/enums/CollectionVisibility";

export default interface Collection {
    id: number;
    name: string;
    description?: string | null;
    visibility?: CollectionVisibility;
    public_key?: string;
    /** Не приходит у скрытых коллекций. */
    public_url?: string;
    films_count?: number;
    films?: CollectionFilm[];
    can_edit?: boolean;
}
