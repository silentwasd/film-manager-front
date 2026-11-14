import type User from "~/resources/User";

export default interface FeedbackResource {
    id: number;
    user?: User;
    /** Номер сезона; null — отзыв на тайтл целиком. */
    season: number | null;
    text: string | null;
    reaction: number;
    create?: boolean;
    created_at: string;
    updated_at: string;
}