import CrudRepository from "~/repos/CrudRepository";
import type Collection from "~/resources/Collection";
import type CollectionFilm from "~/resources/CollectionFilm";
import type Resource from "~/types/Resource";

export default class CollectionRepository extends CrudRepository<Collection, number> {
    protected baseUrl: string = '/management/collections';

    public addFilm(collectionId: number, filmId: number, note?: string | null, position?: number | null): Promise<Resource<CollectionFilm>> {
        return this.client.post<Resource<CollectionFilm>>(
            `${this.baseUrl}/${collectionId}/films`,
            {film_id: filmId, note: note ?? null, ...(position != null ? {position} : {})}
        );
    }

    public updateFilmNote(collectionId: number, filmId: number, note: string | null): Promise<Resource<CollectionFilm>> {
        return this.client.patch<Resource<CollectionFilm>>(
            `${this.baseUrl}/${collectionId}/films/${filmId}`,
            {note}
        );
    }

    public removeFilm(collectionId: number, filmId: number): Promise<void> {
        return this.client.delete<void>(`${this.baseUrl}/${collectionId}/films/${filmId}`);
    }

    public reorder(collectionId: number, filmIds: number[]): Promise<void> {
        return this.client.put<void>(`${this.baseUrl}/${collectionId}/films/reorder`, {films: filmIds});
    }
}
