import Repository from "~/repos/Repository";
import type Rating from "~/resources/Rating";
import type Collection from "~/types/Collection";
import CrudRepository from "~/repos/CrudRepository";

export default class RatingRepository extends CrudRepository<Rating, number> {
    protected baseUrl: string = '/management/films';

    constructor(filmId: number) {
        super();
        this.baseUrl += `/${filmId}/ratings`;
    }
}