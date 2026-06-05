import CrudRepository from "~/repos/CrudRepository";
import type TagResource from "~/resources/management/TagResource";
import type SearchableRepository from "~/types/repos/SearchableRepository";
import type Collection from "~/types/Collection";

export default class TagRepository extends CrudRepository<TagResource, number> implements SearchableRepository {
    protected baseUrl: string = '/management/tags';

    public search(query: string, id?: any): Promise<Collection<TagResource>> {
        return this.client.get(`${this.baseUrl}?` + querify({
            name          : query,
            sort_column   : 'name',
            sort_direction: 'asc',
            per_page      : 100
        }).toString());
    }
}