import CrudRepository from "~/repos/CrudRepository";
import type GenreResource from "~/resources/management/GenreResource";
import type SearchableRepository from "~/types/repos/SearchableRepository";
import type Collection from "~/types/Collection";

export default class GenreRepository extends CrudRepository<GenreResource, number> implements SearchableRepository {
    protected baseUrl: string = '/management/genres';

    public search(query: string, id?: any): Promise<Collection<GenreResource>> {
        return this.client.get(`${this.baseUrl}?` + querify({
            name          : query,
            sort_column   : 'name',
            sort_direction: 'asc',
            per_page      : 100
        }).toString());
    }
}