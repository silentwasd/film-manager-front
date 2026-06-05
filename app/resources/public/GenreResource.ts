import type FilmResource from "~/resources/public/FilmResource";

export default interface GenreResource {
    name: string;
    icon: string;
    description: string;
    films: FilmResource[];
}