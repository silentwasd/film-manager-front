import CrudRepository from "~/repos/CrudRepository";
import type FeedbackResource from "~/resources/FeedbackResource";

export default class FeedbackRepository extends CrudRepository<FeedbackResource, number> {
    protected baseUrl: string = '/films';

    constructor(filmId: number) {
        super();
        this.baseUrl += `/${filmId}/feedback`;
    }
}