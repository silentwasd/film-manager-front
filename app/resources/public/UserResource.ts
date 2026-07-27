import type {CollectionCardResource} from "~/resources/public/CollectionResource";

export default interface UserResource {
    id: number;
    name: string;
    public_key: string;
    collections: CollectionCardResource[];
}
