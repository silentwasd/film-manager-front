import type {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";
import type Film from "~/resources/Film";

export default interface FilmWatcher {
    id: number;
    film_id?: number;
    film?: Film;
    status: FilmWatchStatus;
    reaction?: number;
}