import CrudRepository from "~/repos/CrudRepository";
import type SearchableRepository from "~/types/repos/SearchableRepository";
import type Collection from "~/types/Collection";
import type FranchiseResource from "~/resources/management/FranchiseResource";
import type {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";

export default class FranchiseRepository extends CrudRepository<FranchiseResource, number> implements SearchableRepository {
    protected baseUrl: string = '/management/franchises';

    /**
     * Статусы просмотра текущего пользователя по тайтлам франшизы: film_id => статус.
     */
    public watchStatuses(id: number) {
        return this.client.get<{ data: Record<number, FilmWatchStatus> }>(`${this.baseUrl}/${id}/watch-statuses`);
    }

    public search(query: string, id?: any): Promise<Collection<FranchiseResource>> {
        return this.client.get(`${this.baseUrl}?` + querify({
            name          : query,
            sort_column   : 'name',
            sort_direction: 'asc',
            per_page      : 100
        }).toString());
    }
}
