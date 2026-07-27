import Repository from "~/repos/Repository";
import type CollectionResource from "~/resources/public/CollectionResource";
import type Resource from "~/types/Resource";

export default class CollectionRepository extends Repository {
    /** Публичная коллекция: короткий адрес. */
    public show(key: string) {
        return this.client.getData<Resource<CollectionResource>>(
            `collection.public.${key}`,
            `/collections/${key}`
        );
    }

    /** Личная коллекция: единственный адрес — внутри профиля автора. */
    public showPersonal(userKey: string, key: string) {
        return this.client.getData<Resource<CollectionResource>>(
            `collection.personal.${userKey}.${key}`,
            `/users/${userKey}/collections/${key}`
        );
    }
}
