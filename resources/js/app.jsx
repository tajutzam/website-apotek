import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Apotek Mandiri';

const appElement = document.getElementById('app');
let initialPage;
if (appElement?.dataset?.page) {
    try {
        initialPage = JSON.parse(appElement.dataset.page);
    } catch {
        initialPage = undefined;
    }
}

createInertiaApp({
    page: initialPage,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#0d9488',
        showSpinner: true,
    },
});
