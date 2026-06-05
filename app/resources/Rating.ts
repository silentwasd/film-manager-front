import type User from "~/resources/User";

export default interface Rating {
    id: number;
    user?: User | null;
    data: {
        comment: string
    };
    created_at?: number;
}