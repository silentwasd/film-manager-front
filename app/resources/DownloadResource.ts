import type {DownloadStatus} from "~/types/enums/DownloadStatus";

export default interface DownloadResource {
    id: number;
    url: string;
    progress: number;
    status: DownloadStatus | null;
    hash: string | null;
    name: string | null;
    has_film: boolean;
}