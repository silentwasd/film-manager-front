import CrudRepository from "~/repos/CrudRepository";
import type FilmVideoVariantResource from "~/resources/production/FilmVideoVariantResource";

export default class FilmVideoVariantRepository extends CrudRepository<FilmVideoVariantResource, number> {
    protected baseUrl: string = '/production/films';

    constructor(filmId: number) {
        super();
        this.baseUrl += `/${filmId}/video-variants`;
    }

    preview(data: any) {
        return this.client.post(`${this.baseUrl}/preview`, data);
    }
}