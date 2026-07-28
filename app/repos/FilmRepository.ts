import type Film from "~/resources/Film";
import CrudRepository from "~/repos/CrudRepository";
import type SearchableRepository from "~/types/repos/SearchableRepository";
import type Collection from "~/types/Collection";
import type PersonResource from "~/resources/PersonResource";
import type Resource from "~/types/Resource";

export default class FilmRepository extends CrudRepository<Film, number> implements SearchableRepository {
    protected baseUrl: string             = '/management/films';
    protected override postFiles: boolean = true;
    protected override putFiles: boolean  = true;

    /**
     * Создаёт карточку по данным аниме с Шикимори.
     *
     * Запрос долгий — до полуминуты: бэкенд ходит в их API за ролями и озвучкой
     * и выкачивает постер с фотографиями персон. Форму слать нельзя,
     * store() у этого репозитория уходит multipart'ом, а тут нужен обычный JSON.
     */
    public importFromShikimori(data: {
        shikimori_id: number,
        with_people?: boolean,
        with_seyu?: boolean
    }): Promise<Resource<Film> & { log: string[] }> {
        return this.client.post(`${this.baseUrl}/import/shikimori`, data);
    }

    public search(query: string, id?: any): Promise<Collection<PersonResource>> {
        return this.client.get(`${this.baseUrl}?` + querify({
            name          : query,
            sort_column   : 'name',
            sort_direction: 'asc',
            ...(id ?? false) ? {model_id: id} : {}
        }).toString());
    }
}