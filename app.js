

var noop = function(){};
if(!window.console) window.console = {};
if(!window.console.log) window.console.log = noop;
if(!window.console.info) window.console.info = noop;
if(!window.console.warn) window.console.warn = noop;

var sfc = String.fromCharCode, wav,//expose a named ref to wav within itself
d = document, ce = function(nn){return d.createElement(nn)}, duri = function(s){return "data:audio/wav;base64,"+s}
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
		var hex = i.toString(16);
		var reversed = hex.split('').reverse().join('').match(/.{1,2}/g).map(function(v){return v.split('').reverse().join('')});
		
		var voodoo = '';
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
	generateFrequency:function(frequency,sample_rate,duration,bits,cb){
		var samples_per_cycle = sample_rate/frequency,
		deg = 180/samples_per_cycle,
		samples = sample_rate*duration,
		max = Math.pow( 2, bits ),
		halfMax = max/2,
		unsign = 0;
		
		if(bits == 8) unsign = halfMax; 
		for(i=0;i<samples;i+=deg) {
			var sample = Math.sin(i)*halfMax;
			cb(sample+unsign);
		}
	},
	/*generateFrequency:function(frequency,sample_rate,duration,bits,cb){
		var vol = Math.pow( 2, bits )/0.5;
		for (var i = 0; i < sample_rate * duration; i++) {
			var v = vol * Math.sin((2 * Math.PI) * (i / sample_rate) * frequency);
			cb(v);
		}
	},*/
	plotableFrequency:function(frequency,sample_rate,duration,cb){
		this.generateFrequency(frequency,sample_rate,duration,8,function(point){
			cb(point);//plot unsigned bit range
		});
	},
	generateWav:function(frequency,sample_rate,duration,bits){
		

		var c3,c2,bits_per_sample = bits,num_channels = 1,ics = wav.intToChunkSize;
		//NumSamples * NumChannels * BitsPerSample/8
		var samples = "";
		var z = this;

		if(!(frequency instanceof Array)) frequency = [frequency];
		
		frequency.forEach(function(f,k){
			z.generateFrequency(f,sample_rate,duration,bits_per_sample,function(point){
				
				if(bits_per_sample == 8){
					samples += sfc(point & 255);
				} else {
					//16bit
					samples += String.fromCharCode(point & 255, (point >> 8) & 255);
				}
			});
		});
		
		c3 = "data"+ics(samples.length,4)+samples;
		
		//   16 offset   pcm  num channels
		c2 = ics(16,4)+ics(1,2)+ics(num_channels,2);
		//      sample rate                    byte rate
		c2 += ics(sample_rate,4)+ics((sample_rate * num_channels * bits_per_sample)/8,4)
		//           block align                     bits per sample
		c2 += ics((num_channels * bits_per_sample)/8,2)+ics(bits_per_sample,2)+c3;
		
		return "RIFF"+this.intToChunkSize(c2.length,4)+"WAVEfmt "+c2;
	}
}
//---------------------------------------------------
console.info('STARTING CHUNK SIZE TEST:');

var chunk = sfc(parseInt("24",16))+
sfc(parseInt("08",16))+
sfc(parseInt("00",16))+
sfc(parseInt("00",16));

var size = wav.readChunkSize(chunk);

console.log(size);
console.log(wav.intToChunkSize(size,4),' should equal ',chunk);

//---------------------------------------------------
console.info('STARTING PARSE TEST:');

wav.parse(atob(wavHeader));


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

	var generated = {};
	c.addEventListener('click', function(ev){
		var x = ev.clientX,y = ev.clientY;
		//white key
		var key = Math.floor(x/100);

		var h = ev.currentTarget.height,b_key = -1;
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
		
		key = (((+key)*-1)+10)+30;

		if(!generated[key]){
			generated[key] = new Audio(duri(btoa(wav.generateWav(pianoFrequency(key),8000,0.5,16))));
		}
		generated[key].play();
	},false);
};

piano(c);
/*
var x = c.getContext('2d');
//draw wavform
var w = 0;
x.beginPath();    
x.strokeStyle = "rgba(200,0,0,0.3)"; 
wav.plotableFrequency(5,8000,0.5,function(point){
	if(w < c.width){
		x.lineTo(w,point);//(point+32767)/256));
		w +=2;
	}
});
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
audio provided me with good unit testing fodder:
	http://www.e2s.com/x10-tones.htm
frequency chart for piano
	http://www.euclideanspace.com/art/music/scale/index.htm
frequency equation for piano
	http://en.wikipedia.org/wiki/Piano_key_frequencies
the js example i found while trying to get my frequencies to sound right
	http://www.sk89q.com/playground/jswav/
*/
