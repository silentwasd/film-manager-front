import Repository from "~/repos/Repository";
import type GenreResource from "~/resources/public/GenreResource";
import type Resource from "~/types/Resource";

export default class GenreRepository extends Repository {
    protected baseUrl: string = '/genre';

    public show(genre: string) {
        return this.client.getData<Resource<GenreResource>>(`genre.${genre}`, this.baseUrl + `/${genre}`);
    }
}