import Repository from "~/repos/Repository";
import type HomeResource from "~/resources/public/HomeResource";
import type Resource from "~/types/Resource";

export default class HomeRepository extends Repository {
    public show() {
        return this.client.getData<Resource<HomeResource>>('home', '/home');
    }

    /** Случайный тайтл; вошедшему — из ещё не просмотренных. */
    public random() {
        return this.client.get<Resource<{ id: number | null }>>('/home/random');
    }
}
