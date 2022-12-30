class idbMainClass {
	constructor() {
		this.supported = true;
		if (!window.indexedDB) {
		this.supported = false;
		}
	}
	getDbs(clb = function(){}) {
		indexedDB.databases().then(clb)
	}
	has(name = '', clb = function(){}) {
		this.getDbs((dbs) => {var a = true;
			dbs.forEach((item) => {
				if (a === true) {
					if (item.name === name) {a = false;clb(true, item.version)}
				}
			}); if (a) clb(false)})
	}
	open(name = 'newDb', clb = function(){}, errorclb = function(){}) {
		this.has(name, function(result, version) {
			if(result) { handleOpen(version, true)}
			else {handleOpen(1, false)}
		});
		function handleOpen(version, before) {
			var request = window.indexedDB.open(name, version);
			request.onerror = function(event) {
				errorclb(event.target.errorCode);
			};
			request.onsuccess = function(event) {
				clb(before, new idbDBClass(event.target.result));
			};
			request.onupgradeneeded = function (event) {
				
		}
		}
	}
	delete(db = null, clb = function(){}, errorclb = function(){} ) {
		if (db === null) return ;
		db.close();
		var request = window.indexedDB.deleteDatabase(db.name);
		request.onerror = function(event) {
			errorclb(event.target.errorCode);
		};
		request.onsuccess = function(event) {
			clb();
		};
		
	}
	
}
class idbDBClass{
	constructor(db) {
		this.name = db.name;
		this.db = db;
		this.version = db.version;
		this.objStore = {};
		var self = this;
		Array.from(self.db.objectStoreNames).forEach((item) => {
			self.objStore[item] = new idbObjStoreClass(item, self)
		});
	}
	close() {
		this.db.close()
	}
	createObjStore(name ='new', clb = function(){}, errorclb = function(){}) {
		if (this.objStore[name] !== undefined) {clb(this.objStore[name], true); return};
		var self = this;
		this.db.close();
		var request = window.indexedDB.open(this.name, this.version + 1);
		
		request.onerror = function(event) {
			errorclb(event.target.errorCode);
		};
		request.onsuccess = function(event) {
			self.db = event.target.result;
			self.objStore[name] = new idbObjStoreClass(name, self);
			self.version = self.version + 1;
			clb(self.objStore[name], false);
		};
		request.onupgradeneeded = function (event) {
			self.db = event.target.result;
			self.db.createObjectStore(name);
		};
	}
	deleteObjStore(name ='new', clb = function(){}, errorclb = function(){}) {
		if (this.objStore[name] === undefined) {clb(true); return};
		var self = this;
		this.db.close();
		var request = window.indexedDB.open(this.name, this.version + 1);
		
		request.onerror = function(event) {
			errorclb(event.target.errorCode);
		};
		request.onsuccess = function(event) {
			self.db = event.target.result;
			delete self.objStore[name];
			self.version = self.version + 1;
			clb(false);
		};
		request.onupgradeneeded = function (event) {
			self.db = event.target.result;
			self.db.deleteObjectStore(name);
		};
	}
	
}
class idbObjStoreClass {
	constructor(name, db) {
		this.name = name;
		this.db = db;
	}
	m(name, clb, errorclb, ...args) {
		var result = null;
		var trans = this.db.db.transaction(this.name, 'readwrite');
		trans.oncomplete = function() {
			clb(result)
		}
		trans.onerror = function(event) {
			errorclb(event.target.errorCode);
		};
		var request = trans.objectStore(this.name)[name](...args);
		request.onerror = function(event) {
			errorclb(event.target.errorCode);
		};
		request.onsuccess = function(event) {
		result = event.target.result;
				
		};
	}
	has(key = '', clb = function(){}, errorclb = function(){}) {
		this.m('getAllKeys', (items) => {
			var a = false;
			items.forEach((item) => {
				if (item === key) a = true;
			});
			clb(a);
		}, errorclb)
	}
	add(key = 'new', value = 'hallo', clb = function(){}, errorclb = function(){}) {
		this.m('add', clb, errorclb, value, key);
	}
	put(key = 'new', value = 'hallo', clb = function(){}, errorclb = function(){}) {
		this.m('put', clb, errorclb, value, key);
	}
	get(key = 'new', clb = function(){}, errorclb = function(){}) {
		this.m('get', clb, errorclb, key);
	}
	delete(key = 'new', clb = function(){}, errorclb = function(){}) {
		this.m('delete', clb, errorclb, key);
	}
	count(clb = function(){}, errorclb = function(){}) {
		this.m('count', clb, errorclb);
	}
	clear(clb = function(){}, errorclb = function(){}) {
		this.m('clear', clb, errorclb);
	}
	pm(name, ...args) {
		return new Promise((resolve, reject) => {
			this.m(name, resolve, reject, ...args)
		});
	}
	phas(key = '') {
		return new Promise((resolve, reject) => {
			this.m('getAllKeys', (items) => {
			var a = false;
			items.forEach((item) => {
				if (item === key) a = true;
			});
			resolve(a);
		}, reject)
		})
	}
	padd(key = 'new', value = 'hallo') {
		return this.pm('add', value, key);
	}
	pput(key = 'new', value = 'hallo') {
		return this.pm('put', value, key);
	}
	pget(key = 'new') {
		return this.pm('get', key);
	}
	pdelete(key = 'new') {
		return this.pm('delete', key);
	}
	pcount() {
		return this.pm('count');
	}
	pclear() {
		return this.pm('clear');
	}
}
window.$idb = new idbMainClass();