import Repository from "~/repos/Repository";
import type Friends from "~/resources/management/Friends";
import type {FriendshipState} from "~/resources/management/Friends";
import type UserCard from "~/resources/management/UserCard";

type StateResponse = { state: FriendshipState };

export default class FriendRepository extends Repository {
    protected baseUrl: string = '/management/friends';

    public list(): Promise<Friends> {
        return this.client.get<Friends>(this.baseUrl);
    }

    /** Заявка; встречная сразу превращается в дружбу. */
    public request(userId: number): Promise<StateResponse> {
        return this.client.post<StateResponse>(this.baseUrl, {user_id: userId});
    }

    public accept(userId: number): Promise<StateResponse> {
        return this.client.post<StateResponse>(`${this.baseUrl}/${userId}/accept`);
    }

    /** Удалить из друзей, отклонить входящую или отозвать исходящую. */
    public remove(userId: number): Promise<StateResponse> {
        return this.client.delete<StateResponse>(`${this.baseUrl}/${userId}`);
    }

    public invite(): Promise<{ url: string }> {
        return this.client.get<{ url: string }>(`${this.baseUrl}/invite`);
    }

    public resetInvite(): Promise<{ url: string }> {
        return this.client.post<{ url: string }>(`${this.baseUrl}/invite/reset`);
    }

    public previewInvite(token: string): Promise<{ user: UserCard, state: FriendshipState }> {
        return this.client.get(`${this.baseUrl}/invite/${token}`);
    }

    public acceptInvite(token: string): Promise<{ user: UserCard, state: FriendshipState }> {
        return this.client.post(`${this.baseUrl}/invite/${token}`);
    }
}
