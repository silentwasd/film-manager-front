import type Collection from "~/types/Collection";

export default interface PaginatedCollection<Type> extends Collection<Type> {
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        from: number;
        to: number;
        total: number;
    }
}