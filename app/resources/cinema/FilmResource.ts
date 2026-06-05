import type FilmVideoVariantResource from "~/resources/cinema/FilmVideoVariantResource";

export default interface FilmResource {
    id: number;
    name: string;
    video_variants?: FilmVideoVariantResource[];
}