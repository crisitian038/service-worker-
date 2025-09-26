const CACHE_NAME = 'bitacora-sw-v1.0.0';

// Función para enviar eventos a la página
function enviarEvento(evento, estado) {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                tipo: 'BITACORA',
                evento: evento,
                estado: estado
            });
        });
    });
}

// Evento de instalación
self.addEventListener('install', event => {
    enviarEvento('INSTALANDO', 'Ejecutando instalación...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                enviarEvento('INSTALANDO', 'Creando cache...');
                return cache.addAll(['./']);
            })
            .then(() => {
                enviarEvento('INSTALADO', 'Instalación completada');
                return self.skipWaiting(); // Activar inmediatamente
            })
    );
});

// Evento de activación
self.addEventListener('activate', event => {
    enviarEvento('ACTIVACION', 'Ejecutando activación...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        enviarEvento('ACTIVACION', `Eliminando cache anterior: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            enviarEvento('ACTIVO', 'Service Worker activado');
            return self.clients.claim(); // Controlar todas las páginas
        })
    );
});

// Evento fetch - se ejecuta cuando el SW está "ocioso"
self.addEventListener('fetch', event => {
    enviarEvento('OSIOSO', `Interceptando petición: ${event.request.url}`);
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// Enviar evento ocioso periódicamente
setInterval(() => {
    enviarEvento('OSIOSO', 'Ejecutándose en segundo plano');
}, 10000); // Cada 10 segundos

// Evento inicial
enviarEvento('OSIOSO', 'Service Worker cargado');