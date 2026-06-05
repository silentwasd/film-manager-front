import CrudRepository from "~/repos/CrudRepository";
import type FilmPersonResource from "~/resources/FilmPersonResource";

export default class FilmPersonRepository extends CrudRepository<FilmPersonResource, number> {
    protected baseUrl: string = '/management/films';

    constructor(filmId: number) {
        super();
        this.baseUrl += `/${filmId}/persons`;
    }
}