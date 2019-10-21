var version = 'v4';
var staticCacheName = 'myHomeCache' + version;
var mustHaveCacheFiles = [
	'/favicon.ico',
	'/android-chrome-192x192.png',
	'/manifest.json',
	'/css/main.min.css',
	'/js/amazon-cognito-identity.min.js',
	'/js/atomic.polyfills.min.js',
	'/js/navigation.min.js',
	'/js/logout.min.js',
	'/offline.html',
	'/home-projects.html',
	'/project-create.html',
	'/workers-project.html'
];
// var mustHaveCacheFiles = ['/', '/stylesheetv0-0-1.css', '/javascriptv0-0-1.js', '/font.woff', '/offline.html'];
// var niceToHaveCacheFiles = ['icon.svg']; // removed 'image.jpg' from array (add back if to see difference) as want to cache asset in images cache - logic currently checks staticCacheName then imageCache for asset before caching in imageCache

// VERSION 1 - offline file
var cacheList = [staticCacheName];

// VERSION 2 - seperate image cache
// var imageCacheName = 'images';
// var cacheList = [staticCacheName, imageCacheName];

// VERSION 3 - seperate page cache
// var pagesCacheName = 'pages';
// var cacheList = [staticCacheName, imageCacheName, pagesCacheName];

// TRIM CACHE - Trim the number of items in cacheName to maxItems
// function trimCache(cacheName, maxItems) {
// 	caches.open(cacheName)
// 		.then( cache => {
// 			cache.keys()
// 				.then( items => {
// 					if( items.length > maxItems ) {
// 						cache.delete(items[0])
// 							.then( 
// 								trimCache(cacheName, maxItems)
// 							);
// 					}
// 				});
// 		});
// }

// STASH IN CACHE - fetch from network, open cache, put file in cache
// function stashInCache(request, cacheName) {
// 	// fetch file
// 	fetch(request)
// 		.then( responseFromFetch => {
// 			// open the cache
// 			caches.open(cacheName)
// 				.then( theCache => {
// 					// put file in cache
// 					return theCache.put(request, responseFromFetch);
// 				});
// 		})
// 		.catch( error => {
// 			return console.error('NOT ON NETWORK - stash in cache', error);
// 		})
// }

// SYNC EXAMPLE FN
// function fetchCatImage () {
//     fetch('./cat.jpg')
//       .then(function (response) {
//         return response;
//       })
//       .then(function (text) {
//         console.log('Request successful', text);
//       })
//       .catch(function (error) {
//         console.log('Request failed', error);
//         // throw error;
//       });
// }

// triggered when service worker is first installed
self.addEventListener('install', function(installEvent) {
	skipWaiting(); // - forces the waiting service worker to become the active service worker
	// wait until cache is populated then install service worker
	installEvent.waitUntil(
		caches.open(staticCacheName)
			.then( cache => {
				// addAll - array of urls to store in cache - no typos otherwise nothing will get cached from array
				// cache.addAll(niceToHaveCacheFiles); // nice to have cached
				return cache.addAll(mustHaveCacheFiles); // use return to ensure all files get cached - must cache
			})
			// // only need to create image cache here if want to have files in there from the start
			// .then( () => {
			// 	caches.open(imageCacheName)
			// 		.then( cache => {
			// 			// do nothing but create image cache
			// 		})
			// })
			.catch( (err) => console.error('Cache Failed', err) )
	);
});

// clean up

self.addEventListener('activate', function(activateEvent) {
	console.log('activate');
	activateEvent.waitUntil(
		// access cache names
		caches.keys()
			.then( cacheNames => {
				// needs to be asynchronous in service worker so using Promise here
				return Promise.all(
					cacheNames.map( cacheName => {
						// check if the caches match the current cache name and if not delete
						// if( cacheName != staticCacheName ) {
						// 	return caches.delete(cacheName);
						// }
						// check if name exists in cacheList
						if( !cacheList.includes(cacheName) ) {
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then( () => {
				// force service worker to take control immediately of any opened pages / tabs
				return clients.claim();
			})
	);
});

// triggered every time browser requests a resource
self.addEventListener('fetch', fetchEvent => {
	// console.log('inside Fetch', fetchEvent);
	// console.log('FETCH EVENT: ', fetchEvent);
	var request = fetchEvent.request;
	var requestURL = new URL(request.url); // used to determine the index (root) route
	/* HTML FILE CACHING LOGIC - try network first, otherwise show fallback */
	// console.log('requestURL',requestURL);
	// use headers to write specific logic for different file types
	if( request.headers.get('Accept').includes('text/html') ) {
		// when / (root home page) requested - go to network then check the cache oterwise fallback (will be in staticCacheName from the start)
		// console.log('requestURL',requestURL);
		if( requestURL.pathname === '/' ) {
			// console.log('HERE IN HOME PAGE');
			fetchEvent.respondWith(
				// fetch page from network
				fetch(request)
					.then( responseFromFetch => {
						// console.log('responseFromFetch', responseFromFetch);
						// check if resource exists and if so copy to cache
						// if( responseFromFetch.status === 200 ) {
						// 	// put a copy in the cache
						// 	var copy = responseFromFetch.clone();
						// 	fetchEvent.waitUntil(
						// 		caches.open(staticCacheName)
						// 			.then( staticCacheName => {
						// 				return staticCacheName.put(request, copy);
						// 			})
						// 	);
						// }
						// return original request unmodified
						return responseFromFetch;
					})
					.catch( error => {
						console.log('NOT ON THE NETWORK - home page', error);
						// check cache to see if available
						return caches.match(request)
							.then( responseFromCache  => {
								if( responseFromCache ) {
									return responseFromCache;
								}
								// otherwise show the fallback page
								return caches.match('/offline.html');
							})
					})
			);
			return; // go no further
		}

		/*
		// when /articles/ requested - try the cache first
		if( request.url.includes('/articles') ) {
			// console.log('HERE IN ARTICLES');
			fetchEvent.respondWith(
				// look in the cache
				caches.match(request)
					.then( responseFromCache => {
						if( responseFromCache ) {
							// fetch fresh version from network
							fetchEvent.waitUntil(
								stashInCache(request, pagesCacheName)
							);
							console.log('Send response from cache for /articles');
							// send back response from the cache
							return responseFromCache;
						}
						// otherwise fetch the page from the network
						return fetch(request)
							.then( responseFromFetch => {
								// put a copy in the cache
								var copy = responseFromFetch.clone();
								fetchEvent.waitUntil(
									caches.open(pagesCacheName)
										.then( pagesCache => {
											return pagesCache.put(request, copy);
										})
								);
								return responseFromFetch;
							})
							.catch( error => {
								// otherwise show the fallback page
								return caches.match('/offline.html');
							});
					})
			);
			return; // go no further
		}
		*/

		
		// hijack for posting data from form.html
		/*
		if( requestURL.pathname.includes('/form') && fetchEvent.request.method  === "POST") {
			console.log('THIS IS THE FORM PAGE POST');
			// todo: SHOW NORMAL NETWORK RESPONSE FIRST then do cache (check online or offline and handle?)

			// return cache for form page
			fetchEvent.respondWith(
				// look in the cache
				caches.match(request, {ignoreMethod: true} )
					.then( responseFromCache => {
						if( responseFromCache ) {
							// send back response from the cache - if JS submit listener does not work
							return responseFromCache;
						}
					}).catch( error => {
						// otherwise show the fallback page
						return caches.match('/offline.html');
					})
			);
			return; // go no further
		} else {
			// handle all other html files - try the network first
			fetchEvent.respondWith(
				// fetch page from network
				fetch(request)
					.then( responseFromFetch => {
						// check if resource exists and if so copy to cache
						if( responseFromFetch.status === 200 ) {
							// if /notinitiallycached then then don't cache until user chooses too (presses button)
							if( !request.url.includes('/notinitiallycached') ) {
								// put a copy in the cache
								var copy = responseFromFetch.clone();
								fetchEvent.waitUntil(
									caches.open(pagesCacheName)
										.then( pagesCache => {
											return pagesCache.put(request, copy);
										})
								);
							}
						}
						return responseFromFetch;
					})
					.catch( error => {
						console.log('NOT ON THE NETWORK - all other html files');
						// check cache to see if available
						return caches.match(request)
							.then( responseFromCache  => {
								if( responseFromCache ) {
									return responseFromCache;
								}
								// otherwise show the fallback page
								return caches.match('/offline.html');
							})
					})
					
			);
			return; // go no further
		}
		*/
	} else {
		
		fetchEvent.respondWith(
			// fetch page from network
			fetch(request)
				.then( responseFromFetch => {
					// console.log('responseFromFetch', responseFromFetch);
					// check if resource exists and if so copy to cache
					// if( responseFromFetch.status === 200 ) {
					// 	// put a copy in the cache
					// 	var copy = responseFromFetch.clone();
					// 	fetchEvent.waitUntil(
					// 		caches.open(staticCacheName)
					// 			.then( staticCacheName => {
					// 				return staticCacheName.put(request, copy);
					// 			})
					// 	);
					// }
					// return original request unmodified
					return responseFromFetch;
				})
				.catch( error => {
					console.log('NOT ON THE NETWORK - home page', error);
					// check cache to see if available
					return caches.match(request)
						.then( responseFromCache  => {
							if( responseFromCache ) {
								return responseFromCache;
							}
							// otherwise show the fallback page
							return caches.match('/offline.html');
						})
				})
		);


		// EVERYTHING ELSE
		// fetchEvent.respondWith(
		// 	// first look in the cache - can open the cache first but this is a more concise and quicker way
		// 	caches.match(request)
		// 		// if caches.match doesn't find file then doesn't reject (returns null) so no catch clause needed
		// 		.then( responseFromCache => {
		// 			if( responseFromCache ) {
		// 				return responseFromCache;
		// 			}
		// 			// go to network if file not in cache 
		// 			return fetch(request);
		// 		})
		// );
	}

	/* SPECIFIC IMAGE CACHING LOGIC - try cache first, otherwise go to network and keep a copy */
	/*
	// use headers to write specific logic for different file types
	if( request.headers.get('Accept').includes('image') ) {
		fetchEvent.respondWith(
			// look for a cached version of image
			caches.match(request)
				.then( responseFromCache  => {
					if( responseFromCache ) {
						// ** Could add below commented out logic to fetch a fresh version from network and put it in cache
						// fetchEvent.waitUntil( return stashInCache(request, imageCacheName) );
						return responseFromCache;
					}
					// otherwise fetch the image from the network
					return fetch(request)
						.then( responseFromFetch => {
							// put a copy in the cache
							var copy = responseFromFetch.clone();
							fetchEvent.waitUntil(
								caches.open(imageCacheName)
									.then( imageCache => {
										return imageCache.put(request, copy);
									})
							);
							return responseFromFetch;
						})
						.catch( error => {
							// otherwise show a fallback image
							console.log('show fallback - not in cache and can\'t get from network');
							return;
							// return caches.match('/fallback.jpg');
						})
				})

		);
		return; // go no further
	}

	// EVERYTHING ELSE CACHING LOGIC - try cache first, otherwise go to network 
	*/
	// fetchEvent.respondWith(
	// 	// first look in the cache - can open the cache first but this is a more concise and quicker way
	// 	caches.match(request)
	// 		// if caches.match doesn't find file then doesn't reject (returns null) so no catch clause needed
	// 		.then( responseFromCache => {
	// 			if( responseFromCache ) {
	// 				return responseFromCache;
	// 			}
	// 			// go to network if file not in cache 
	// 			return fetch(request);
	// 		})
	// );

	
});
/*
self.addEventListener('sync', function(event) {
	console.log('now online');
	// if success then sync is complete. If it fails, another sync will be scheduled to retry. Retry syncs also wait for connectivity, and employ an exponential back-off.
	if( event.tag === 'myFirstSync' ) {
		console.log('THIS SYNC WORKED');
	}
	if(event.tag === 'image-fetch' ) {
		console.log('wow image fetch');
		event.waitUntil(fetchCatImage());
	}
	// SERVICE WORKERS DO NOT HAVE ACCESS TO SYNCHRONOUS APIS (e.g. LOCALSTORAGE) - need to use postMessage (can access indexedDB and cookies using fetch(url, {credentials: 'include'}))
	if( event.tag === 'post-form' ) {
		console.log('I AM HERE in SW post-form');
    	// Access clients
    	// event.waitUntil(
			clients
				.matchAll()
				.then( clients => {
					clients.forEach( client => {	
						// console.log('CHECK THIS: ', client);		
						// Exit early if we don't have access to the client.
							// Eg, if it's cross-origin.
						if (!client.id) return;
				        // client.postMessage({
				        //   	msg: "Hey I just got a fetch from you!",
				        //   	url: client.url
				        // });
				        // Trigger form post - local storage accessed on form.html (can't access in service worker)
								client.postMessage('form post');
					});
				})
				.catch( err => console.log('error getting client', err) )
	    // );

		// console.log(indexedDB); - access
		// console.log('POST FORM');
		// console.log('HELLO', localStorage); - no access
		// event.waitUntil(
		// 	new Promise(function(resolve, reject) {
		// 		if( localStorage.getItem('user') ) {
		// 			resolve(JSON.parse(localStorage.getItem('user')));
		// 		} else {
		// 			reject('it failed');
		// 		}
		// 	}).then(function(res) {
		// 		// access to the localStorage object
		// 		console.log('res: ', res);
		// 		// return response;
		// 	}).catch(function(err) {
		// 		console.log('error: ', err);
		// 		throw Error; // since we are in a catch, it is important an error is thrown, so the background sync knows to keep retrying the send to server
		// 	})
		// );
	}
});
*/
/*
// postMessage - send instructions from a web page to a service worker - can be triggered by any page that is currently controlled by service worker
self.addEventListener('message', messageEvent => {
	// data property holds info send by web page postMessage method - messageEvent.data
	if( messageEvent.data === 'clean up caches') {
		trimCache(pagesCacheName, 20); // remove items from cache when over 20 items in there
		trimCache(imageCacheName, 50); // remove items from cache when over 50 items in there
	}
	// if( messageEvent.data === 'postForm' ) {
		
	// }
});
*/