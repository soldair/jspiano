

console.log(wavHeader);

if(!window.console) window.console = {info:function(){},log:function(){},warn:function(){}};
sfc = function(i){
	return String.fromCharCode(i);
}

d = document;
ce = function(nn){return d.createElement(nn);}

var wav,stc =String.fromCharCode;
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

		while(wavHeader.length > offset){
			var c = wavHeader.substr(offset,1);
			console.log(c);
			console.log(btoa(c));
			offset++;
		}
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
	encodeInt:function( data, bits, signed ,bigEndian){
		var max = Math.pow( 2, bits );
		( data >= max || data < -( max >> 1 ) ) && ( data = 0 );
		data < 0 && ( data += max );
		for( var r = []; data; r[r.length] = String.fromCharCode( data % 256 ), data = Math.floor( data / 256 ) );
		for( bits = -( -bits >> 3 ) - r.length; bits--; r[r.length] = "\0" );
		return ( bigEndian ? r.reverse() : r ).join( "" );
	},
	generateFrequency:function(frequency,sample_rate,duration,cb){
		var samples_per_cycle = sample_rate/frequency;
		var deg = 180/samples_per_cycle;
		var samples = sample_rate*duration;
		
		for(i=0;i<samples;i+=deg) {
			var sample = Math.sin(i)*128;//32767;//16 bit int
			cb(parseInt(sample+128));
		}
	},
	generateWav:function(frequency,sample_rate,duration){
		var c3,c2,bits_per_sample = 8,num_channels = 1,ics = function(i,len){return wav.intToChunkSize(i,len)};
		//NumSamples * NumChannels * BitsPerSample/8
		var samples = "";
		var z = this;
		this.generateFrequency(frequency,sample_rate,duration,function(point){
			//if(point<256 && point>0){
				samples += stc(point);
			//} else {
			//	samples += z.encodeInt(point,16,point<0,true);
			//}
		});
		
		c3 = "data"+ics(samples.length,4)+samples;
		//   16 offset   pcm  num channels
		c2 = ics(16,4)+ics(1,2)+ics(num_channels,2);
		//      sample rate                    byte rate
		c2 += ics(sample_rate,4)+ics((sample_rate * num_channels * bits_per_sample)/8,4)
		//           block align                     bits per sample
		c2 += ics(num_channels * bits_per_sample,2)+ics(bits_per_sample,2)+c3;
		
		return "RIFF"+c2.length+"WAVEfmt "+c2;
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

//---------------------------------------------------
console.info('STARTING frequency TEST:');

var c = document.getElementById('c');

c.width = 4000;
c.height = 256;

var x = c.getContext('2d');
x.beginPath();    
var w = 0;
wav.generateFrequency(262,8000,0.5,function(point){
	x.lineTo(w,parseInt(point));//(point+32767)/256));
	w +=2;
});

x.stroke(); 

//---------------------------------------------------
console.info('STARTING WAV TEST');

var dataURI = "data:audio/x-wav;base64,"+btoa(wav.generateWav(262,8000,0.5));
console.log(dataURI);

var ael = ce('audio');

d.body.appendChild(ael);
ael.src = dataURI;
ael.play();

//download link
var a = ce('a');
a.href = dataURI;
d.body.appendChild(a);
a.appendChild(d.createTextNode('download audio!'));
/*
CREDITS:
great explaination of the wav file format
	https://ccrma.stanford.edu/courses/422/projects/WaveFormat/
audio provided me with good unit testing fodder:
	http://www.e2s.com/x10-tones.htm
frequency chart for piano
	http://www.euclideanspace.com/art/music/scale/index.htm
*/
