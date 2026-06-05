import type Collection from "~/types/Collection";

export default interface SearchableRepository {
    search(query: string, id?: any): Promise<Collection<any>>;
}