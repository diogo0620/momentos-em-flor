const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error(
        "NEXT_PUBLIC_API_URL não está definida."
    );
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function getAccessToken() {
    return accessToken;
}

type ApiOptions = RequestInit & {
    skipRefresh?: boolean;
};

async function refreshAccessToken(): Promise<string | null> {
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            setAccessToken(null);
            return null;
        }

        const data = await response.json();

        setAccessToken(data.accessToken);

        return data.accessToken;
    } catch {
        setAccessToken(null);
        return null;
    }
}

export async function apiUpload<T>(
    endpoint: string,
    file: File,
): Promise<T> {
    const formData = new FormData();

    formData.append("file", file);

    const headers = new Headers();

    if (accessToken) {
        headers.set(
            "Authorization",
            `Bearer ${accessToken}`,
        );
    }

    let response = await fetch(
        `${API_URL}${endpoint}`,
        {
            method: "POST",
            headers,
            body: formData,
            credentials: "include",
        },
    );

    if (response.status === 401) {
        const newAccessToken =
            await refreshAccessToken();

        if (newAccessToken) {
            headers.set(
                "Authorization",
                `Bearer ${newAccessToken}`,
            );

            response = await fetch(
                `${API_URL}${endpoint}`,
                {
                    method: "POST",
                    headers,
                    body: formData,
                    credentials: "include",
                },
            );
        }
    }

    if (!response.ok) {
        let message =
            "Ocorreu um erro no upload do ficheiro.";

        try {
            const error = await response.json();

            if (typeof error.message === "string") {
                message = error.message;
            } else if (
                Array.isArray(error.message)
            ) {
                message = error.message.join(", ");
            }
        } catch {
            // Mantém a mensagem genérica.
        }

        throw new Error(message);
    }

    return response.json();
}

export async function apiFetch<T>(
    endpoint: string,
    options: ApiOptions = {},
): Promise<T> {
    console.log("API FETCH:", endpoint);
    console.log("ACCESS TOKEN:", accessToken);

    const {
        skipRefresh = false,
        ...fetchOptions
    } = options;

    const headers = new Headers(
        fetchOptions.headers,
    );

    headers.set(
        "Content-Type",
        "application/json",
    );

    if (accessToken) {
        headers.set(
            "Authorization",
            `Bearer ${accessToken}`,
        );
    }

    console.log(
    "ABOUT TO FETCH:",
    `${API_URL}${endpoint}`,
);

    let response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...fetchOptions,
            headers,
            credentials: "include",
        },
    );

    if (
        response.status === 401 &&
        !skipRefresh
    ) {
        const newAccessToken =
            await refreshAccessToken();

        if (newAccessToken) {
            headers.set(
                "Authorization",
                `Bearer ${newAccessToken}`,
            );

            response = await fetch(
                `${API_URL}${endpoint}`,
                {
                    ...fetchOptions,
                    headers,
                    credentials: "include",
                },
            );
        }
    }

    if (!response.ok) {
        let message =
            "Ocorreu um erro na comunicação com o servidor.";

        try {
            const error = await response.json();

            if (typeof error.message === "string") {
                message = error.message;
            } else if (
                Array.isArray(error.message)
            ) {
                message = error.message.join(", ");
            }
        } catch {
            // Mantém a mensagem genérica.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}