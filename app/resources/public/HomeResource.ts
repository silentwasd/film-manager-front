import type {FilmFormat} from "~/types/enums/FilmFormat";
import type {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";

/** Минимум для карточки на постере. */
export interface HomeFilm {
    id: number;
    name: string;
    original_name?: string | null;
    format: FilmFormat;
    cover?: string;
    cover_thumb?: string | null;
    produced_year?: number;
    release_date?: string;
}

export interface HomeSpotlight extends HomeFilm {
    description: string;
    background_cover: string;
    genres: { name: string, slug: string }[];
}

export interface HomeTopFilm extends HomeFilm {
    likes: number;
    watched: number;
}

export interface HomeReview {
    id: number;
    text: string;
    reaction: -1 | 0 | 1;
    user: string | null;
    updated_at: string;
    film: HomeFilm;
}

export interface HomeFranchise {
    id: number;
    name: string;
    count: number;
    from: number | null;
    to: number | null;
    covers: string[];
}

export interface HomeGenre {
    name: string;
    slug: string;
    icon: string | null;
    count: number;
}

export interface HomeShelfFilm extends HomeFilm {
    status: FilmWatchStatus;
}

export default interface HomeResource {
    stats: { films: number, series: number, people: number, reviews: number };
    spotlight: HomeSpotlight[];
    premieres: HomeFilm[];
    top: HomeTopFilm[];
    reviews: HomeReview[];
    franchises: HomeFranchise[];
    genres: HomeGenre[];
    recent: HomeFilm[];
    personal: {
        name: string;
        must_finish: HomeShelfFilm[];
        to_watch: HomeShelfFilm[];
        watched: number;
    } | null;
}
