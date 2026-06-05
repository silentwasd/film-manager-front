import type {UserRole} from "~/types/enums/UserRole";

export default interface ProfileResource {
    id: number;
    name: string;
    role: UserRole;
}