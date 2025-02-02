import CrudRepository from "~/repos/CrudRepository";
import type PersonResource from "~/resources/PersonResource";
import type SearchableRepository from "~/types/repos/SearchableRepository";
import type Collection from "~/types/Collection";
import type {PersonRole} from "~/types/enums/PersonRole";

export default class PersonRepository extends CrudRepository<PersonResource, number> implements SearchableRepository {
    protected baseUrl: string   = '/management/people';
    override postFiles: boolean = true;
    override putFiles: boolean  = true;

    private role?: PersonRole;

    constructor(role?: PersonRole) {
        super();
        this.role = role;
    }

    public search(query: string, id?: any): Promise<Collection<PersonResource>> {
        return this.client.get(`${this.baseUrl}?` + querify({
            name          : query,
            sort_column   : 'films_count',
            sort_direction: 'desc',
            model_id      : id ?? undefined,
            role          : this.role
        }).toString());
    }
}