/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MERCADO_PAGO_PUBLIC_KEY: string;
    readonly VITE_RECAPTCHA_SITE_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}