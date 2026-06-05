export default class ApiClient {
    private buildFormData(data: any): FormData {
        const form = new FormData();

        for (const key in data) {
            if (data[key] === null || data[key] === undefined)
                continue;

            if (Array.isArray(data[key])) {
                data[key].forEach((item: any, index: number) => form.append(`${key}[${index}]`, item));
            } else {
                form.append(key, data[key]);
            }
        }

        return form;
    }

    public get<Type>(request: string): Promise<Type> {
        const config = useRuntimeConfig();
        const token  = useToken();

        const headers: any = {};

        if (token.value) {
            headers.Authorization = `Bearer ${token.value}`;
        }

        return $fetch<Type>(request, {
            baseURL: config.public.apiUrl,
            headers: {
                Accept: 'application/json',
                ...headers
            }
        });
    }

    public post<Type>(request: string, data: any = {}, asMultipart: boolean = false): Promise<Type> {
        const config = useRuntimeConfig();
        const token  = useCookie('token');

        const headers: any = {};

        if (token.value) {
            headers.Authorization = `Bearer ${token.value}`;
        }

        if (asMultipart)
            data = this.buildFormData(data);

        return $fetch<Type>(request, {
            baseURL: config.public.apiUrl,
            headers: {
                Accept: 'application/json',
                ...headers
            },
            method : 'POST',
            body   : data
        });
    }

    public put<Type>(request: string, data: any = {}, asMultipart: boolean = false): Promise<Type> {
        const config = useRuntimeConfig();
        const token  = useCookie('token');

        const headers: any = {};

        if (token.value) {
            headers.Authorization = `Bearer ${token.value}`;
        }

        if (asMultipart) {
            data = this.buildFormData(data);
            data.append('_method', 'PUT');
        }

        return $fetch<Type>(request, {
            baseURL: config.public.apiUrl,
            headers: {
                Accept: 'application/json',
                ...headers
            },
            method : asMultipart ? 'POST' : 'PUT',
            body   : data
        });
    }

    public patch<Type>(request: string, data: any = {}, asMultipart: boolean = false): Promise<Type> {
        const config = useRuntimeConfig();
        const token  = useCookie('token');

        const headers: any = {};

        if (token.value) {
            headers.Authorization = `Bearer ${token.value}`;
        }

        if (asMultipart) {
            data = this.buildFormData(data);
            data.append('_method', 'PATCH');
        }

        return $fetch<Type>(request, {
            baseURL: config.public.apiUrl,
            headers: {
                Accept: 'application/json',
                ...headers
            },
            method : asMultipart ? 'POST' : 'PATCH',
            body   : data
        });
    }

    public delete<Type>(request: string, data: any = {}, asMultipart: boolean = false): Promise<Type> {
        const config = useRuntimeConfig();
        const token  = useCookie('token');

        const headers: any = {};

        if (token.value) {
            headers.Authorization = `Bearer ${token.value}`;
        }

        if (asMultipart) {
            data = this.buildFormData(data);
            data.append('_method', 'DELETE');
        }

        return $fetch<Type>(request, {
            baseURL: config.public.apiUrl,
            headers: {
                Accept: 'application/json',
                ...headers
            },
            method : asMultipart ? 'POST' : 'DELETE',
            body   : data
        });
    }

    public getData<Type>(key: string, request: string) {
        return useAsyncData<Type>(key, () => this.get<Type>(request));
    }

    public getLazyFetch<Type>(request: () => string) {
        const config = useRuntimeConfig();
        const token  = useCookie('token');

        const headers: any = {};

        if (token.value) {
            headers.Authorization = `Bearer ${token.value}`;
        }

        return useLazyFetch<Type>(request, {
            baseURL: config.public.apiUrl,
            headers: {
                Accept: 'application/json',
                ...headers
            }
        });
    }
}