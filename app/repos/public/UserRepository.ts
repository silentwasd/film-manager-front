import Repository from "~/repos/Repository";
import type UserResource from "~/resources/public/UserResource";
import type Resource from "~/types/Resource";

export default class UserRepository extends Repository {
    protected baseUrl: string = '/users';

    public show(key: string) {
        return this.client.getData<Resource<UserResource>>(`user.public.${key}`, `${this.baseUrl}/${key}`);
    }
}
