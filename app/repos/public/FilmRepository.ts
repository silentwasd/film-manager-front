import CrudRepository from "~/repos/CrudRepository";
import type FilmResource from "~/resources/public/FilmResource";

export default class FilmRepository extends CrudRepository<FilmResource, number> {
    protected baseUrl: string = '/films';
}