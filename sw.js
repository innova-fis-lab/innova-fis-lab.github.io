// La web ya es pública: este service worker elimina el antiguo (versión con contraseña) y recarga las páginas abiertas.
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil((async function(){
  for(const k of await caches.keys()) await caches.delete(k);
  try{indexedDB.deleteDatabase('ifl')}catch(_){}
  await self.registration.unregister();
  for(const c of await self.clients.matchAll({type:'window'})) c.navigate(c.url);
})())});
