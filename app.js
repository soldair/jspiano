/*
* JsPiano 
* Copyright (c) 2010 Ryan Day
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

//make sure console doesnt break stuff
var noop = function(){};
if(!window.console) window.console = {};
if(!window.console.log) window.console.log = noop;
if(!window.console.info) window.console.info = noop;
if(!window.console.warn) window.console.warn = noop;

var sfc = String.fromCharCode, wav,//expose a named ref to wav within itself
d = document, ce = function(nn){return d.createElement(nn)}, duri = function(s,x){return "data:"+(x||"audio/wav")+";base64,"+s},ua=navigator.userAgent, chr = ua.indexOf('Chrome')!=-1, saf = ua.indexOf('Safari')!=-1 & !chr,opr=ua.indexOf('Opera'),bits=16;//(saf?8:16);

wav ={
	parse:function(wavHeader){
		//RIFF
		console.log('====',wavHeader.substr(0,4));
		console.log('chunkSize: ',wav.readChunkSize(wavHeader.substr(4,4)));
		console.log('====',wavHeader.substr(8,4));
		console.log('====',wavHeader.substr(12,4));
		var sc1 = wav.readChunkSize(wavHeader.substr(16,4));
		console.log('Subchunk1Size: ',sc1);
		console.log('Audio format: ',wav.readChunkSize(wavHeader.substr(20,2)) == 1?'PCM':'dont know format');
		console.log('NumChannels: ',wav.readChunkSize(wavHeader.substr(22,2)));
		console.log('SampleRate: ',wav.readChunkSize(wavHeader.substr(24,4)));
		
		//SampleRate * NumChannels * BitsPerSample/8
		console.log('ByteRate: ',wav.readChunkSize(wavHeader.substr(28,4)));
		
		//NumChannels * BitsPerSample/8
		console.log('BlockAlign: ',wav.readChunkSize(wavHeader.substr(32,2)));
		console.log('BitsPerSample: ',wav.readChunkSize(wavHeader.substr(34,2)));

		var offset = 36,limit = 0;
		
		if((sc1-=16) && sc1 > 0){
			do{
				if(offset == 36){
					console.log('ExtraSize: ',wavHeader.substr(offset,2));
				} else {
					console.log('ExtraParam: ',wavHeader.substr(offset,2));
				}
				offset += 2;
				limit++;
				if(limit == 100){
					console.warn('hit a loop limit looking for extra params');
					break;
				}
			}while((sc1 -= 2) > 0)
		}

		console.log('====',wavHeader.substr(offset,4));
		offset+=4;
		var dataSize = wav.readChunkSize(wavHeader.substr(offset,4));
		console.log('data size: ',dataSize);
		offset+=4;
		console.info('last offset ', offset);
		
		
		console.log('not traversing data');
		/*while(wavHeader.length > offset){
			var c = wavHeader.substr(offset,1);
			console.log(c);
			console.log(btoa(c));
			offset++;
		}*/
	},
	readChunkSize:function(cs){
		var dec = "";
		var hit = 0;
		for(var i=cs.length-1;i>-1;i--) {
			var c = cs.charCodeAt(i);
			//console.log(c,c.toString(16));
			if(c || hit) {
				hit=1;
				dec = dec+''+c.toString(16);
			}
		}
		return parseInt(dec,16);
	},
	intToChunkSize:function(i,len){
		return wav.packer(i,len*8);
	},
	packer:function(v,bits){
		var s = '',i;
		for(i=0,b=bits/8;i<b;i++){
			s+=String.fromCharCode(v & 255);
			v = v >> 8;
		}
		return s;
	},
	generateFrequency:function(frequency,sample_rate,duration,bits,cb){
		var k = 2* Math.PI * frequency / sample_rate,
			samples = sample_rate*duration,
			max = Math.pow( 2, bits ),
			halfMax = (max/2)-1,
			unsign = 0;

		if(bits == 8) unsign = halfMax; 
		
		for (var i=0; i<samples; i++) {
			
			cb((Math.sin(k * i)*halfMax)+unsign,i);
		}
	},
	plotableFrequency:function(frequency,sample_rate,duration,cb){
		var max = Math.pow(2,16),
			half = max/2,
			h = 256,
			z = this;
		
		this.generateFrequency(frequency,sample_rate,duration,16,function(point){
			//point = z.effects.volume(point,1.1,16);
			cb(parseInt((point+half)*256/max));//plot unsigned bit range
		});
	},
	generateWav:function(frequency,sample_rate,duration,bits){
		var c3,c2,num_channels = 1,ics = wav.intToChunkSize,samples = "",z = this,h=Math.pow(2,bits)/2;

		if(!(frequency instanceof Array)) frequency = [frequency];
		var lastSample = 0;
		frequency.forEach(function(f,k){
			var tick = false;
			if(f.prepare) {
				freq = f.frequency;
				tick = f.prepare({frequency:freq,sample_rate:sample_rate,duration:duration,bits:bits,key:k,total:frequency.length});
				f = freq;
			}
			z.generateFrequency(f,sample_rate,duration,bits,function(point,sample){
				if(tick) point = tick(point,sample);//sound effects hook

				if(bits==8) point+=128;
				lastSample = point;
				samples += z.packer(parseInt(point),bits);
			});
			//console.log('lastSample ',lastSample);
		});
		
		c3 = "data"+ics(samples.length,4)+samples;
		
		//   16 offset   pcm  num channels
		c2 = ics(16,4)+ics(1,2)+ics(num_channels,2);
		//      sample rate                    byte rate
		c2 += ics(sample_rate,4)+ics((sample_rate * num_channels * bits)/8,4)
		//           block align                     bits per sample
		c2 += ics((num_channels * bits)/8,2)+ics(bits,2)+c3;
		
		return "RIFF"+this.intToChunkSize(c2.length,4)+"WAVEfmt "+c2;
	},
	effects:{
		//fade out is setup as a generate wav callback but it is and intended arch for all effect functions
		// it should really be in another object as it is like a packaged transform
		fadeOut:function(d,fade_duration){
			var f=d.frequency,sample_rate = d.sample_rate,duration=d.duration,bits=d.bits,k=d.key,total = d.total;
			//THERE IS AN ANNOYING POPPING SOUND  at the end of generated wavs me thinks is related to the difference of the last  sample value and 0 - no volume no pop i cant inject extra samples without modifiying the wav headers
			
			var v=79,dec=0,z=this;
			//var samples_per_wave = Math.round(sample_rate/f),
			var samples_in_last = sample_rate*(fade_duration||0.03),
				dec_interval = v/samples_in_last,
				s_samples = (sample_rate*duration),
				decriment_at_sample = s_samples-samples_in_last;
				
			//console.log(samples_in_last,'---',dec_interval,'---',s_samples,'----',decriment_at_sample);
				
			return function(point,sample){
				//return z.volume(point,10,bits);
				if(sample >= decriment_at_sample) {
					dec += dec_interval;
					if(dec >=1 && v){
						v--;
						dec = 0;
						var start = point;
					}
					var s = point;
					point = z.volume(point,v,bits);
				}
				return point;
			}
			
			return false;
		},
		//standard "tick" function designed to be called to apply a single transform to a single point
		volume:function(point,v,bits){
			var max = Math.pow(2,bits)/2;
			point = point*Math.tan(v/100.0);
			if(point > max) {
				point = max
			} else if(point < -max) {
				point = -max
			}
			return point;
		}
	}
}
//---------------------------------------------------
/*
console.info('STARTING CHUNK SIZE TEST:');

var chunk = sfc(parseInt("24",16))+
sfc(parseInt("08",16))+
sfc(parseInt("00",16))+
sfc(parseInt("00",16));

var size = wav.readChunkSize(chunk);

console.log(size);
console.log(wav.intToChunkSize(size,4),' should equal ',chunk);
*/
//---------------------------------------------------
/*
console.info('STARTING PARSE TEST:');

wav.parse(atob(wavHeader));
*/

var c = document.getElementById('c');

var pianoFrequency = function(i){
	return 440*Math.pow(1.0594630943,(i+1)-49)
}


var piano = function(c){

	c.width = 700;
	c.height = 256;
	var x = c.getContext('2d');

	x.beginPath();
	var height = 255,width = 100,w = 0,num = 7,keys = [],i = 0;
	while(num) {
		x.moveTo(w,0);
		x.lineTo(w,height);//top to bottom
		x.lineTo((w += width),height);//line on bottom
		keys.push({color:'white',key:i});
		num--;i++;
	}
	x.lineTo(w,0);
	x.stroke(); 

	//black keys
	b_w = 50;
	b_h = Math.floor(height/3)*2;
	w = b_w+(b_w/2);


	//2 skip 3 skip
	var regions = [],cursor = 0;
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
			
			keys.splice(cursor,0,{color:'black',key:regions.length});
			regions.push({t:[w,0],b:[w+b_w,b_h]});

			cursor++;
		}
		w+= width;
		num++;
	}
	
	var d_e = ce('div'),a_e=ce('a'),ad_e=ce('a'),p_e=ce('a'),notes_e=ce('div'),
	addNote = function(note,a){
		var txt =notes_e.textContent,a=[];
		if(txt.length)a=txt.split(',');
		a.push(note);
		if(a.length > 10)a.shift();
		notes_e.textContent = a.join(',');
	},
	buildSound = function(f,m){
		if(!f.map) f=[f];
		
		f.map(function(v,k){
			f[k]={
				frequency:v,
				prepare:function(data){
					return wav.effects.fadeOut(data,0.02);
				}
			};
		});
		
		return duri(btoa(wav.generateWav(f,11025,0.5,bits)),m);
	},
	generated = {},
	generateSound = function(key){
		key = pianoFrequency((+key)+40);//starts at middle c
		if(!generated[key]){
			generated[key] = new Audio(buildSound(key));
		}
		addNote(key);
		if(generated[key].currentTime > 0){
			generated[key].currentTime = 0;
		}// else {
			generated[key].play();
		//}
		//window.testAudio = generated[key]; 
	};
	
	//--- make download app


	d_e.appendChild(notes_e);

	ad_e.textContent=' Download Wav ';
	d_e.appendChild(ad_e);
	ad_e.addEventListener('click',function(ev){
		window.location = buildSound(notes_e.textContent.split(','),'application/wav');
	},false);

	a_e.textContent=' | Export Wav ';
	d_e.appendChild(a_e);
	a_e.addEventListener('click',function(ev){
		window.location = buildSound(notes_e.textContent.split(','));
	},false);
	
	if(!chr){
		p_e.textContent='| Play Wav ';
		d_e.appendChild(p_e);
		p_e.addEventListener('click',function(ev){
			var a = new Audio(buildSound(notes_e.textContent.split(',')));
			a.play();
		},false);
	}

	d.body.appendChild(d_e);
	//------------

	//click interaction implementation
	c.addEventListener('click', function(ev){
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
				var v  = keys[i];
				if(v['color']=='black' && v['key'] == b_key) {
					key = i;
					break;
				}
			} else {
				if(v['color']=='white' && v['key'] == key) {
					key = i;
					break;
				}
			}
		}
		generateSound(key);
	},false);

	var downtime = {};
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
	return generated;
};

var generated = piano(c);
/*
var p = d.getElementById('p');
p.width = 700;
p.height = 256;

x = p.getContext('2d');
//draw wavform
var w = 0;
x.beginPath();    
x.strokeStyle = "rgba(200,0,0,0.3)"; 
wav.plotableFrequency(pianoFrequency(40),8000,0.5,function(point){
	if(w < c.width){
		x.lineTo(w,point);//(point+32767)/256));
		w +=2;
	} else {
		//x.moveTo(0,point)
		//w = 0;
	}
});
x.stroke();  


var l = d.getElementById('l');
l.width = 100;
l.height = 100;
x = l.getContext('2d');
//draw wavform
var w = 0;
x.beginPath();    
x.strokeStyle = "rgba(0,200,100,0.3)"; 
x.moveTo(0,100);
for(i=100;i>0;i--) {
	x.lineTo(w,parseInt(Math.log(i)*21.72));
	w++;

}
x.stroke();  
*/
/*
var frequencies = [];
for(i =0;i<10;i++) {
	frequencies.push(pianoFrequency(i));
}

var wav_16 = wav.generateWav(frequencies,8000,0.5,16);
var dataURI = duri(btoa(wav_16));

console.log(dataURI);

a = new Audio(dataURI);
a.play();
*/
/*
var a = ce('a');
a.href = dataURI;
d.body.appendChild(a);
a.appendChild(d.createTextNode('download audio!'));
*/


//wav.parse(atob(testDownsampled.split('base64,')[1]));
/*
setTimeout(function(){
	aeld = new Audio(testDownsampled);
	aeld.play();
},1000)
*/
//var dataURI = "data:audio/wav;base64,"+btoa(wav_8);



/*
ael = new Audio(dataURI);
ael.play();

setTimeout(function(){
	var dataURI = "data:audio/wav;base64,"+btoa(wav.generateWav(262,16000,0.5,16));
	console.log(dataURI);

	aeld = new Audio(dataURI);
	aeld.play();
},1000);


setTimeout(function(){
	console.log('test pre generated');
	aeld = new Audio(testGenerated);
	aeld.play();
},2000);

setTimeout(function(){
	console.log('test resampled');
	ael2 = new Audio('test-resampled.wav');
	ael2.play();
},3000);

setTimeout(function(){
	console.log('test resampled data uri');
	ael3 = new Audio(testResampled);
	ael3.play();
},6000);

//download link

*/

/*
CREDITS:
great explaination of the wav file format
	https://ccrma.stanford.edu/courses/422/projects/WaveFormat/
frequency chart for piano
	http://www.euclideanspace.com/art/music/scale/index.htm
frequency equation for piano
	http://en.wikipedia.org/wiki/Piano_key_frequencies
the js example i found while trying to get my frequencies to sound right. his dont sound right
	http://www.sk89q.com/playground/jswav/
https://wiki.mozilla.org/Audio_Data_API
	has a good example of creating tones using the html5 audio data api
	//size is how many samples you want to write to fill the specified interval (a second)
	//no need to over tax cpus grinding out more
	//t is the start offset
	function getSoundData(t, size) {
		var soundData = new Float32Array(size); //<---- awesome new typed array
		if (freq) {
			var k = 2* Math.PI * freq / sampleRate;
			for (var i=0; i<size; i++) {
				soundData[i] = Math.sin(k * (i + t));
			}
		}
		return soundData;
	}
audio effects / volume
	http://www.ypass.net/blog/2010/01/pcm-audio-part-3-basic-audio-effects-volume-control/
*/
