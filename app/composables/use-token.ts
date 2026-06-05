export default function () {
    return useCookie('token', {expires: new Date(Date.now() + 3600 * 24 * 31 * 1000)});
}