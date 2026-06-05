import CrudRepository from "~/repos/CrudRepository";
import type FilmAudioVariantResource from "~/resources/production/FilmAudioVariantResource";

export default class FilmAudioVariantRepository extends CrudRepository<FilmAudioVariantResource, number> {
    protected baseUrl: string = '/production/films';

    constructor(filmId: number) {
        super();
        this.baseUrl += `/${filmId}/audio-variants`;
    }

    markAsDefault(id: number) {
        return this.client.post(`${this.baseUrl}/${id}/mark-as-default`);
    }

    preview(data: any) {
        return this.client.post(`${this.baseUrl}/preview`, data);
    }
}