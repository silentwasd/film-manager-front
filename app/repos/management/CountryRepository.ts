import CrudRepository from "~/repos/CrudRepository";
import type CountryResource from "~/resources/management/CountryResource";
import type SearchableRepository from "~/types/repos/SearchableRepository";
import type Collection from "~/types/Collection";

export default class CountryRepository extends CrudRepository<CountryResource, number> implements SearchableRepository {
    protected baseUrl: string = '/management/countries';

    public search(query: string, id?: any): Promise<Collection<CountryResource>> {
        return this.client.get(`${this.baseUrl}?` + querify({
            name          : query,
            sort_column   : 'name',
            sort_direction: 'asc',
            per_page      : 100
        }).toString());
    }
}