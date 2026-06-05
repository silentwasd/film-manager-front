import CrudRepository from "~/repos/CrudRepository";
import type FilmResource from "~/resources/production/FilmResource";

export default class FilmRepository extends CrudRepository<FilmResource, number> {
    protected baseUrl: string = '/production/films';
}