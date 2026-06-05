import CrudRepository from "~/repos/CrudRepository";
import type FilmWatcher from "~/resources/FilmWatcher";
import type Resource from "~/types/Resource";

export default class FilmWatcherRepository extends CrudRepository<FilmWatcher, number> {
    protected baseUrl: string = '/management/film-watchers';

    public byFilm(id: number) {
        return this.client.get<Resource<FilmWatcher>>(`${this.baseUrl}/by-film/${id}`);
    }
}