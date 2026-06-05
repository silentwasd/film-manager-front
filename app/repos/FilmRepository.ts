import type Film from "~/resources/Film";
import CrudRepository from "~/repos/CrudRepository";
import type SearchableRepository from "~/types/repos/SearchableRepository";
import type Collection from "~/types/Collection";
import type PersonResource from "~/resources/PersonResource";

export default class FilmRepository extends CrudRepository<Film, number> implements SearchableRepository {
    protected baseUrl: string             = '/management/films';
    protected override postFiles: boolean = true;
    protected override putFiles: boolean  = true;

    public search(query: string, id?: any): Promise<Collection<PersonResource>> {
        return this.client.get(`${this.baseUrl}?` + querify({
            name          : query,
            sort_column   : 'name',
            sort_direction: 'asc',
            ...(id ?? false) ? {model_id: id} : {}
        }).toString());
    }
}