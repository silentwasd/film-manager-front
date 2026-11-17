import type CollectionFilm from "~/resources/CollectionFilm";
import type {CollectionAuthor} from "~/resources/public/CollectionResource";
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
    /** false — чужая коллекция, добавленная к себе: только просмотр. */
    is_own?: boolean;
    /** Только у чужих. */
    author?: CollectionAuthor;
}
