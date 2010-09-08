//i left png packer here because it works but is an epic fail... if you can only serve bin data as a base64 encoded string

var c = document.getElementById('packer');
var compiled = document.getElementById('compiled');
var code = compiled.textContent;

while(code.length%4){
	code+=' ';
}

alert((code.length/4)+' canvas width');

c.width = code.length/4;
c.height = 1;
var buffer = [];

var x = c.getContext('2d');
var imageData = x.createImageData(c.width, 1);

for(i=0,j=code.length;i<j;i++){
	imageData.data[i] = code.charCodeAt(i);  
} 

x.putImageData(imageData, 0, 0);

var d = document.createElement('div');
var codeImage = c.toDataURL();

alert('from '+code.length+' too '+codeImage.length);

d.textContent =codeImage;
document.body.appendChild(d);

var encoded_data = atob(codeImage.split('base64,')[1]);

var evalable_bin = JSON.stringify(encoded_data);

alert('stringified length: '+evalable_bin.length);

eval("var bin = "+evalable_bin);






alert("translated bin === data uri?")



