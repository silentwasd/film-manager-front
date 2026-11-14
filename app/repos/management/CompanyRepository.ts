import CrudRepository from "~/repos/CrudRepository";
import type SearchableRepository from "~/types/repos/SearchableRepository";
import type Collection from "~/types/Collection";
import type CompanyResource from "~/resources/management/CompanyResource";
import type {FilmWatchStatus} from "~/types/enums/FilmWatchStatus";

export default class CompanyRepository extends CrudRepository<CompanyResource, number> implements SearchableRepository {
    protected baseUrl: string = '/management/companies';

    /**
     * Статусы просмотра текущего пользователя по тайтлам студии: film_id => статус.
     */
    public watchStatuses(id: number) {
        return this.client.get<{ data: Record<number, FilmWatchStatus> }>(`${this.baseUrl}/${id}/watch-statuses`);
    }

    public search(query: string, id?: any): Promise<Collection<CompanyResource>> {
        return this.client.get(`${this.baseUrl}?` + querify({
            name          : query,
            sort_column   : 'name',
            sort_direction: 'asc',
            per_page      : 100
        }).toString());
    }
}