export default function (date: string) {
    return date.replace(/^(\d{2}).(\d{2}).(\d{4})$/, '$3-$2-$1');
}