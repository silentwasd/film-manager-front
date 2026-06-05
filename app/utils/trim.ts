export default function (text: string, limit: number = 80, suffix = '...') {
    return text.length > limit ? text.slice(0, limit) + suffix : text;
}