import type UserCard from "~/resources/management/UserCard";

/** Отношение ко мне: self, друзья, я позвал, меня позвали, никак. */
export type FriendshipState = 'self' | 'friends' | 'outgoing' | 'incoming' | 'none';

export default interface Friends {
    friends: UserCard[];
    incoming: UserCard[];
    outgoing: UserCard[];
}
