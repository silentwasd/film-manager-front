import type {FilmVideoVariantStatus} from "~/types/enums/FilmVideoVariantStatus";

export default interface FilmVideoVariantResource {
    id: number;
    name: string;
    bitrate: number;
    crf: number;
    width: number;
    height: number;
    status: FilmVideoVariantStatus;
    path: string | null;
    to_sdr: boolean;
    progress: number;
}