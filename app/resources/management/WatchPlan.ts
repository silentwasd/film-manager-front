import type UserCard from "~/resources/management/UserCard";

export type WatchPlanStatus = 'planned' | 'watching' | 'watched';

export interface WatchPlanFilm {
    id: number;
    name: string;
    original_name: string | null;
    cover: string | null;
    cover_thumb: string | null;
    format: string;
    produced_year: number | null;
    seasons: number | null;
}

export default interface WatchPlan {
    id: number;
    status: WatchPlanStatus;
    position: number;
    note: string | null;
    /** YYYY-MM-DD */
    started_at: string | null;
    finished_at: string | null;
    created_by: number | null;
    film: WatchPlanFilm;
    participants: UserCard[];
}

export interface WatchPlanBoard {
    planned: WatchPlan[];
    watching: WatchPlan[];
    watched: WatchPlan[];
}
