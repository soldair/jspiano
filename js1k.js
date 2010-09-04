/**
 * copyright Ryan Day 2010
 * http://ryanday.org/
 *
 * mit/gpl dual licensed 
 *
 * use it modify it have a ball even make money off of it!
 *
 *
 * hey so this is in heavy dev right now please dont hold me mess against me .... arrr
 *
 * */

//make sure console doesnt break stuff
/*
var noop = function(){};
if(!window.console) window.console = {};
if(!window.console.log) window.console.log = noop;
if(!window.console.info) window.console.info = noop;
if(!window.console.warn) window.console.warn = noop;
*/
var sfc = String.fromCharCode,
d = document,
ce = function(nn){return d.createElement(nn)},
//ce = function(nn){return d.createElement(nn)},cecececece
//i.createElementi.createElementi.createElementi.createElementi.createElement
duri = function(s,x){return "data:"+(x||"audio/x-wav")+";base64,"+s},
ua=navigator.userAgent, 
chr = ua.indexOf('Chrome')!=-1,
bits=16,
ics=function(i,len){
	var hex = i.toString(16),reversed = hex.split('').reverse().join('').match(/.{1,2}/g).map(function(v){return v.split('').reverse().join('')}),voodoo = '';
	for(var i in reversed) {
		voodoo = voodoo+sfc(parseInt(reversed[i],16));
	}
	if(len && voodoo.length < len){
		while(voodoo.length < len){
			voodoo += sfc(0);
		}
	}
	return voodoo;
},
fadeOut=function(d,fade_duration){
	var f=d.frequency,sample_rate = d.sample_rate,duration=d.duration,bits=d.bits,k=d.key,total = d.total;
	//THERE IS AN ANNOYING POPPING SOUND  at the end of generated wavs me thinks is related to the difference of the last  sample value and 0 - no volume no pop i cant inject extra samples without modifiying the wav headers
	
	var v=79,dec=0;
	//var samples_per_wave = Math.round(sample_rate/f),
	var samples_in_last = sample_rate*(fade_duration||0.03),
		dec_interval = v/samples_in_last,
		s_samples = (sample_rate*duration),
		decriment_at_sample = s_samples-samples_in_last;
		
	//console.log(samples_in_last,'---',dec_interval,'---',s_samples,'----',decriment_at_sample);
		
	return function(point,sample){

		if(sample >= decriment_at_sample) {
			dec += dec_interval;
			if(dec >=1 && v){
				v--;
				dec = 0;
				var start = point;
			}
			//--- volume!
			var max = Math.pow(2,bits)/2;
			point = point*Math.tan(v/100.0);
			if(point > max) {
				point = max
			} else if(point < -max) {
				point = -max
			}
			//------
		}
		return point;
	}
	
	return false;
},
c = document.getElementById('c'),
x = c.getContext('2d'),height = 255,width = 100,w = 0,num = 7,keys = [],i = 0,
regions = [],cursor = 0,
d_e = ce('div'),a_e=ce('a'),ad_e=ce('a'),p_e=ce('a'),notes_e=ce('div'),
buildSound = function(frequency,m){
	if(!frequency.map) frequency=[frequency];

	var c3,c2,num_channels = 1,samples = "",h=Math.pow(2,bits)/2,sample_rate=11025;

	//var lastSample = 0;
	frequency.forEach(function(f,k){
		var tick = fadeOut({frequency:f,sample_rate:sample_rate,duration:0.5,bits:bits,key:k,total:frequency.length},0.02);
		//(frequency,sample_rate,duration,bits,cb)

		var k = 2* Math.PI * f / sample_rate,
			total = sample_rate*0.5,
			max = Math.pow( 2, bits ),
			halfMax=(max/2);

		
		for (var sample=0; sample<total; sample++) {
			point=(Math.sin(k * sample)*halfMax);
		
			point = tick(point,sample);
			
			if(bits==8) point+=128;
			//-------------
			point = parseInt(point);
			var s = '',i;
			for(i=0,b=bits/8;i<b;i++){
				s+=sfc(point & 255);
				point = point >> 8;
			}
			//-------------
			samples += s;
		}
	});
	//   16 offset   pcm  num channels
	c2 = ics(16,4)+ics(1,2)+ics(num_channels,2)+ics(11025,4)+ics((sample_rate * num_channels * bits)/8,4)+ics((num_channels * bits)/8,2)+ics(bits,2)+"data"+ics(samples.length,4)+samples;;
	
	return duri(btoa("RIFF"+ics(c2.length,4)+"WAVEfmt "+c2),m);
},
generated = {},
generateSound = function(key){
	key = 440*Math.pow(1.0594630943,((+key)+41)-49)
	if(!generated[key]){
		generated[key] = new Audio(buildSound(key));
	}
	//---- add note
	var txt =notes_e.textContent,a=[];
	if(txt.length)a=txt.split(',');
	a.push(key);
	if(a.length > 10)a.shift();
	notes_e.textContent = a.join(',');
	//---- add note
	if(generated[key].ct > 0){
		generated[key].ct = 0;
	}
	
	generated[key].play();
},click='click',downtime = {};
//--------------- do stuff!!!! --------------
c.width = 700;
c.height = 256;
x.beginPath();

while(num) {
	x.moveTo(w,0);
	x.lineTo(w,height);//top to bottom
	x.lineTo((w += width),height);//line on bottom
	keys.push([1,i]);
	num--;i++;
}
x.lineTo(w,0);
x.stroke(); 

//black keys
b_w = 50;
b_h = Math.floor(height/3)*2;
w = b_w+(b_w/2);


num = 0;
while(num< 6) {
	cursor++;
	if(num != 2 && num != 6){
		x.beginPath();
		x.moveTo(w,0);
		x.lineTo(w,b_h);
		x.lineTo(w+b_w,b_h);
		x.lineTo(w+b_w,0);
		x.lineTo(w,0);
		x.fill();
		
		keys.splice(cursor,0,[2,regions.length]);
		regions.push({t:[w,0],b:[w+b_w,b_h]});

		cursor++;
	}
	w+= width;
	num++;
}

//--- make download app


d_e.appendChild(notes_e);

ad_e.textContent=' Download Wav ';
d_e.appendChild(ad_e);
ad_e.addEventListener(click,function(ev){
	
	window.location = buildSound(notes_e.textContent.split(','),'application/octet-stream');
	
},false);

p_e.textContent='| Play Wav ';
d_e.appendChild(p_e);
p_e.addEventListener(click,function(ev){
	var a = ce('audio');
	//a.src = new Audio(buildSound(notes_e.textContent.split(',')));
	a.src = buildSound(notes_e.textContent.split(','));
	a.controls=1;
	a.style.display = "block";
	d.body.appendChild(a);
	a.play();
},false);

d.body.appendChild(d_e);
//------------

//click interaction implementation
c.addEventListener(click, function(ev){
	var x = ev.clientX,
			y = ev.clientY,
			key = Math.floor(x/100),
			h = ev.currentTarget.height,
			b_key = -1;
	for(var i in regions){
		var d = regions[i];
		if((d.t[0] < x && d.b[0] > x) && (d.t[1] < y && d.b[1] > y)){
			b_key = i;
			break;
		}
	}
	//is black key?
	for(var i in keys){
		var v  = keys[i];
		if(b_key > -1) {
			if(v[0]==2 && v[1] == b_key) {
				key = i;
				break;
			}
		} else {
			if(v[0]==1 && v[1] == key) {
				key = i;
				break;
			}
		}
	}
	generateSound(key);
},false);

d.addEventListener('keydown',function(ev){
	var t = new Date().getTime();
	if(downtime[ev.which] && downtime[ev.which]+350 > t){
		return;
	}
	
	downtime[ev.which] = t;
	var c = sfc(ev.which),k ='awsedftgyhuj'.indexOf(c.toLowerCase());
	if(k >-1){
		generateSound(k);
	}
},false);
