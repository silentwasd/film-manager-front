import CrudRepository from "~/repos/CrudRepository";
import type SearchableRepository from "~/types/repos/SearchableRepository";
import type Collection from "~/types/Collection";
import type CompanyResource from "~/resources/management/CompanyResource";

export default class CompanyRepository extends CrudRepository<CompanyResource, number> implements SearchableRepository {
    protected baseUrl: string = '/management/companies';

    public search(query: string, id?: any): Promise<Collection<CompanyResource>> {
        return this.client.get(`${this.baseUrl}?` + querify({
            name          : query,
            sort_column   : 'name',
            sort_direction: 'asc',
            per_page      : 100
        }).toString());
    }
}