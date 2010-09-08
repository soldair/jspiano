var c = String.fromCharCode, e = document,j = {},k = {};
function g(a, b) {
	a = parseInt(a);
	var d = "", f;
	for(f = 0;f < b;f++) {
		d += c(a & 255);
		a >>= 8
	}
	return d
}

_n = e.createElement("div");
_b = function(a, b) {
	a.map || (a = [a]);
	var d = "";
	for(i in a) {
		for(var f = 2 * Math.PI * a[i] / 11025, h = 0;h < 5512.5;h++) {
			d += g(Math.sin(f * h) * 32768, 2)
		}
	}
	d = g(16, 4) + g(1, 2) + g(1, 2) + g(11025, 4) + g(22050, 4) + g(2, 2) + g(16, 2) + "data" + g(d.length, 4) + d;
	return"data:" + (b || "audio") + "/x-wav;base64," + btoa("RIFF" + g(d.length, 4) + "WAVEfmt " + d)
};

function l(a, b) {
	el = e.createElement("a");
	el.textContent = a;
	e.body.appendChild(el);
	el.addEventListener("click", function() {
		eval(b)
	}, false)
}
e.body.appendChild(_n);
l("Download ", "location = _b(_n.a,'application')");
l("| Play", "new Audio(_b(_n.a)).play()");
e.addEventListener("keydown", function(a,b) {
	b = (new Date).getTime();
	a = a.which;
	if(!(j[a] && j[a] + 350 > b)) {
		j[a] = b;
		b = "AWSEDFTGYHUJ".indexOf(c(a));
		if(b > -1) {
			b = 440 * Math.pow(1.0594630943, +b + 41 - 49);
			k[b] || (k[b] = new Audio(_b(b)));
			a = _n.a || [];
			a.push(b);
			a.length > 10 && a.shift();
			_n.textContent = a.join(",");
			_n.a = a;
			k[b].play()
		}
	}
}, false);