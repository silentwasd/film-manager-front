import Repository from "~/repos/Repository";
import type WatchPlan from "~/resources/management/WatchPlan";
import type {WatchPlanBoard, WatchPlanStatus} from "~/resources/management/WatchPlan";
import type Resource from "~/types/Resource";

export default class WatchPlanRepository extends Repository {
    protected baseUrl: string = '/management/watch-plans';

    public board(friendId?: number | null): Promise<WatchPlanBoard> {
        return this.client.get<WatchPlanBoard>(this.baseUrl + (friendId ? `?friend_id=${friendId}` : ''));
    }

    public store(filmId: number, participants: number[], note?: string | null): Promise<Resource<WatchPlan>> {
        return this.client.post<Resource<WatchPlan>>(this.baseUrl, {film_id: filmId, participants, note: note || null});
    }

    public update(id: number, data: { note?: string | null, participants?: number[] }): Promise<Resource<WatchPlan>> {
        return this.client.patch<Resource<WatchPlan>>(`${this.baseUrl}/${id}`, data);
    }

    /** from — статус, который видел клиент: устарел — сервер ответит 409. */
    public status(id: number, status: WatchPlanStatus, from?: WatchPlanStatus): Promise<Resource<WatchPlan>> {
        return this.client.put<Resource<WatchPlan>>(`${this.baseUrl}/${id}/status`, {status, ...(from ? {from} : {})});
    }

    public reorder(ids: number[]): Promise<void> {
        return this.client.put<void>(`${this.baseUrl}/reorder`, {plans: ids});
    }

    /** Выйти самому; остальные участники план сохраняют. */
    public leave(id: number): Promise<void> {
        return this.client.delete<void>(`${this.baseUrl}/${id}/leave`);
    }

    /** Удалить у всех участников. */
    public destroy(id: number): Promise<void> {
        return this.client.delete<void>(`${this.baseUrl}/${id}`);
    }
}
