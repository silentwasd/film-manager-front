import type Film from "~/resources/Film";

export default interface CompanyResource {
    id: number;
    name: string;
    description: string | null;
    link: string | null;
    can_edit?: boolean;
    films?: Film[];
    films_count?: number;
}