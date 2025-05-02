import type {FilmFormat} from "~/types/enums/FilmFormat";
import type {FilmCinemaStatus} from "~/types/enums/FilmCinemaStatus";

export default interface FilmResource {
    id: number;
    name: string;
    format: FilmFormat;
    cover?: string | File;
    produced_year?: number;
    release_date?: string;
    description?: string;
    cinema_status: FilmCinemaStatus;
}