importScripts('./ngsw-worker.js');

(function () {
    'use strict';

    self.addEventListener('notificationclick', (event) => {
        if (clients.openWindow && event.notification.data.gameId) {
            event.waitUntil(clients.openWindow('https://www.playyourdamnturn.com/game/' + event.notification.data.gameId));
        }
    });}
());