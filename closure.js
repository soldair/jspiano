var g=String.fromCharCode,h=document;function j(a,c){return"data:"+(c||"audio/x-wav")+";base64,"+a}var l=navigator.userAgent.indexOf("Chrome")!=-1;function m(a,c){var d=a.toString(16).split("").reverse().join("").match(/.{1,2}/g).map(function(e){return e.split("").reverse().join("")}),f="";for(a in d)f+=g(parseInt(d[a],16));if(c&&f.length<c)for(;f.length<c;)f+=g(0);return f} function o(a,c){var d=a.e,f=a.c,e=79,i=0,t=d*(c||0.03),z=e/t,n=d*a.duration-t;return function(k,p){if(p>=n){i+=z;if(i>=1&&e){e--;i=0}var u=Math.pow(2,f)/2;k*=Math.tan(e/100);if(k>u)k=u;else if(k<-u)k=-u}return k}}var q=document.getElementById("c"),r=q.getContext("2d"),s=0,v=7,w=[],x=0,y=[],A=0,B=h.createElement("div"),C=h.createElement("a"),D=h.createElement("a"),E=h.createElement("a"),F=h.createElement("div"); function G(a,c){a.map||(a=[a]);var d,f="";a.forEach(function(e,i){var t=o({f:e,e:11025,duration:0.5,c:16,key:i,total:a.length},0.02);i=2*Math.PI*e/11025;for(var z=Math.pow(2,16)/2,n=0;n<5512.5;n++){point=Math.sin(i*n)*z;point=t(point,n);point=parseInt(point);var k="",p;p=0;for(b=2;p<b;p++){k+=g(point&255);point>>=8}f+=k}});d=m(16,4)+m(1,2)+m(1,2)+m(11025,4)+m(22050,4)+m(2,2)+m(16,2)+"data"+m(f.length,4)+f;return j(btoa("RIFF"+m(d.length,4)+"WAVEfmt "+d),c)}var H={}; function I(a){a=440*Math.pow(1.0594630943,+a+41-49);H[a]||(H[a]=new Audio(G(a)));var c=F.textContent,d=[];if(c.length)d=c.split(",");d.push(a);d.length>10&&d.shift();F.textContent=d.join(",");if(H[a].d>0)H[a].d=0;H[a].play()}var J={};q.width=700;q.height=256;for(r.beginPath();v;){r.moveTo(s,0);r.lineTo(s,255);r.lineTo(s+=100,255);w.push([1,x]);v--;x++}r.lineTo(s,0);r.stroke();b_w=50;b_h=Math.floor(85)*2;s=b_w+b_w/2; for(v=0;v<6;){A++;if(v!=2&&v!=6){r.beginPath();r.moveTo(s,0);r.lineTo(s,b_h);r.lineTo(s+b_w,b_h);r.lineTo(s+b_w,0);r.lineTo(s,0);r.fill();w.splice(A,0,[2,y.length]);y.push({b:[s,0],a:[s+b_w,b_h]});A++}s+=100;v++}B.appendChild(F);D.textContent=" Download Wav ";B.appendChild(D);D.addEventListener("click",function(){window.location=G(F.textContent.split(","),"application/wav")},false);C.textContent=" | Export Wav ";B.appendChild(C); C.addEventListener("click",function(){window.location=G(F.textContent.split(","))},false);if(!l){E.textContent="| Play Wav ";B.appendChild(E);E.addEventListener("click",function(){(new Audio(G(F.textContent.split(",")))).play()},false)}h.body.appendChild(B); q.addEventListener("click",function(a){var c=a.clientX,d=a.clientY;a=Math.floor(c/100);var f=-1;for(var e in y){var i=y[e];if(i.b[0]<c&&i.a[0]>c&&i.b[1]<d&&i.a[1]>d){f=e;break}}for(e in w){c=w[e];if(f>-1){if(c[0]==2&&c[1]==f){a=e;break}}else if(c[0]==1&&c[1]==a){a=e;break}}I(a)},false);h.addEventListener("keydown",function(a){var c=(new Date).getTime();if(!(J[a.which]&&J[a.which]+350>c)){J[a.which]=c;a="awsedftgyhuj".indexOf(g(a.which).toLowerCase());a>-1&&I(a)}},false);