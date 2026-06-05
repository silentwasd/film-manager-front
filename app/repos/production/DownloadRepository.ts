import CrudRepository from "~/repos/CrudRepository";
import type DownloadResource from "~/resources/DownloadResource";

export default class DownloadRepository extends CrudRepository<DownloadResource, number> {
    protected baseUrl: string = '/production/downloads';

    public stop(id: number) {
        return this.client.post(`${this.baseUrl}/${id}/stop`);
    }

    public start(id: number) {
        return this.client.post(`${this.baseUrl}/${id}/start`);
    }
}