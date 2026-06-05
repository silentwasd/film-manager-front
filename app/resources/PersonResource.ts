import type CountryResource from "~/resources/management/CountryResource";
import type {PersonRole} from "~/types/enums/PersonRole";
import type FilmPersonResource from "~/resources/FilmPersonResource";
import type {PersonSex} from "~/types/enums/PersonSex";

export default interface PersonResource {
    id: number;
    name: string;
    original_name: string | null;
    birth_date: string | null;
    death_date: string | null;
    sex: PersonSex | null;
    photo: string | null;
    can_edit?: boolean;
    country?: CountryResource | null;
    country_id?: number | null;
    films_count?: number;
    roles?: PersonRole[];
    films?: FilmPersonResource[];
}