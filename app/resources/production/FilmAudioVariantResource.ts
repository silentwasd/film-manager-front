import type {FilmAudioVariantStatus} from "~/types/enums/FilmAudioVariantStatus";

export default interface FilmAudioVariantResource {
    id: number;
    name: string;
    bitrate: number;
    index: number;
    language: string;
    status: FilmAudioVariantStatus;
    is_default: boolean;
    path: string | null;
    progress: number;
}