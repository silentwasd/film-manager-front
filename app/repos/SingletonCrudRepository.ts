import Repository from "~/repos/Repository";
import type Resource from "~/types/Resource";

export default abstract class SingletonCrudRepository<T, ID> extends Repository {
    protected abstract baseUrl: string;
    protected putFiles: boolean  = false;

    public show<R = Resource<T>>(key: string) {
        return this.client.getData<R>(key, `${this.baseUrl}`);
    }

    public get<R = Resource<T>>() {
        return this.client.get<R>(`${this.baseUrl}`);
    }

    public update<R = void>(data: Partial<T>): Promise<R> {
        return this.client.put<R>(`${this.baseUrl}`, data, this.putFiles);
    }
}