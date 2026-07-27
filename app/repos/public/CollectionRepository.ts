import Repository from "~/repos/Repository";
import type CollectionResource from "~/resources/public/CollectionResource";
import type Resource from "~/types/Resource";

export default class CollectionRepository extends Repository {
    protected baseUrl: string = '/collections';

    public show(key: string) {
        return this.client.getData<Resource<CollectionResource>>(`collection.public.${key}`, `${this.baseUrl}/${key}`);
    }
}
