
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('PWA SW Registered:', reg.scope);
                }).catch(function(err) {
                    console.error('PWA SW Register failed:', err);
                });
            });
        }
    