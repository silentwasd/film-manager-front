import {FilmFormat} from "~/types/enums/FilmFormat";

/** Многосерийные форматы — у них бывают сезоны. */
export default function (format?: FilmFormat | null): boolean {
    return format == FilmFormat.Series || format == FilmFormat.MiniSeries || format == FilmFormat.CartoonSeries;
}
