$idb.open('sog', (i,db)=> {
	db.createObjStore('sgjhden', (obj) => {
		globalThis.sogobjS = obj;
		obj.pget('obj').then((obj) => globalThis.sogobj = obj || {})
	})
});
function setVal(el) {
	globalThis['val' + el.name] = el.value
}
document.querySelectorAll('.x').forEach(el => {
	[...el.children].forEach(el => {
		try {
			el.childNodes[1].value = el.childNodes[0].textContent
		} catch(error) {
			
		}
	})
});
function addToSog() {
	var elin = document.getElementById('in');
	if (!elin.value) return;
	if (!(valfirst in sogobj)) sogobj[valfirst] = [];
	sogobj[valfirst].push({value: elin.value, last: vallast})
	sogobjS.put('obj', sogobj)
	outalpha()
}
function sogref() {
	sogobj = {};
	sogobjS.put('obj', sogobj)
}
function remsog(nb, alpha) {
	sogobj[alpha] = sogobj[alpha].filter((ii,i) => i !== nb);
	sogobjS.put('obj', sogobj);
	outalpha()
}
function outnb() {
	var outel = document.getElementById('out');
	var str1='حرف البداية:';
	var obj1 = {};
	for (let haref in sogobj) {
		str1 += '|| ' + haref + ':' + sogobj[haref].length;
		sogobj[haref].forEach(item => {
			if (!(item.last in obj1)) obj1[item.last] = 0;
			obj1[item.last]++
		})
	}
	var str2 = 'حرف النهاية:'
	for (let i in obj1) {
		str2 += '|| ' + i + obj1[i]
	}
	outel.innerText = str1 + '\n' + str2
}
function outalpha() {
	var outel = document.getElementById('out');
	var arr = sogobj[valout];
	var str = '';
	arr.forEach((item, i) => {
		str += '<div>' + (i+1) + ': ' + item.value.replaceAll('***', '&emsp;') + '(' + item.last + ')<span onclick="remsog(' + i + ',\'' + valout + '\')"></span></div>' 
	});
	outel.innerHTML = str;
}