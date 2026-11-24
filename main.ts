import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const W = 1024, H = 1024;
const pix = Buffer.alloc(W * H * 4, 0);
function color(c) { return c; }
function rect(x, y, w, h, c) {
  for (let yy = Math.max(0,y); yy < Math.min(H,y+h); yy++) {
    let p = (yy * W + Math.max(0,x)) * 4;
    for (let xx = Math.max(0,x); xx < Math.min(W,x+w); xx++, p += 4) {
      pix[p]=c[0]; pix[p+1]=c[1]; pix[p+2]=c[2]; pix[p+3]=255;
    }
  }
}
function line(x1,y1,x2,y2,c,t=3) {
  const dx=Math.abs(x2-x1), sx=x1<x2?1:-1, dy=-Math.abs(y2-y1), sy=y1<y2?1:-1; let e=dx+dy;
  for (;;) { rect(x1-Math.floor(t/2),y1-Math.floor(t/2),t,t,c); if(x1===x2&&y1===y2)break; const e2=2*e; if(e2>=dy){e+=dy;x1+=sx;} if(e2<=dx){e+=dx;y1+=sy;} }
}
const ink=[20,28,38], paper=[246,242,228], navy=[18,43,70], red=[192,53,42], gold=[226,164,54], teal=[40,126,126], blue=[63,107,158], rust=[177,83,44];
rect(0,0,W,H,paper);
const glyphs = {
'A':['01110','10001','10001','11111','10001','10001','10001'],'B':['11110','10001','10001','11110','10001','10001','11110'],'C':['01111','10000','10000','10000','10000','10000','01111'],'D':['11110','10001','10001','10001','10001','10001','11110'],'E':['11111','10000','10000','11110','10000','10000','11111'],'F':['11111','10000','10000','11110','10000','10000','10000'],'G':['01111','10000','10000','10111','10001','10001','01111'],'H':['10001','10001','10001','11111','10001','10001','10001'],'I':['11111','00100','00100','00100','00100','00100','11111'],'J':['00111','00010','00010','00010','10010','10010','01100'],'K':['10001','10010','10100','11000','10100','10010','10001'],'L':['10000','10000','10000','10000','10000','10000','11111'],'M':['10001','11011','10101','10101','10001','10001','10001'],'N':['10001','11001','10101','10011','10001','10001','10001'],'O':['01110','10001','10001','10001','10001','10001','01110'],'P':['11110','10001','10001','11110','10000','10000','10000'],'Q':['01110','10001','10001','10001','10101','10010','01101'],'R':['11110','10001','10001','11110','10100','10010','10001'],'S':['01111','10000','10000','01110','00001','00001','11110'],'T':['11111','00100','00100','00100','00100','00100','00100'],'U':['10001','10001','10001','10001','10001','10001','01110'],'V':['10001','10001','10001','10001','10001','01010','00100'],'W':['10001','10001','10001','10101','10101','11011','10001'],'X':['10001','10001','01010','00100','01010','10001','10001'],'Y':['10001','10001','01010','00100','00100','00100','00100'],'Z':['11111','00001','00010','00100','01000','10000','11111'],
'0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
'.':['00000','00000','00000','00000','00000','00110','00110'],',':['00000','00000','00000','00000','00110','00110','00100'],':':['00000','00110','00110','00000','00110','00110','00000'],"'":['00100','00100','00000','00000','00000','00000','00000'],'-':['00000','00000','00000','01110','00000','00000','00000'],'/':['00001','00010','00010','00100','01000','01000','10000'],'(' :['00010','00100','01000','01000','01000','00100','00010'],')':['01000','00100','00010','00010','00010','00100','01000'],'&':['01100','10010','10100','01000','10101','10010','01101'],'%':['11001','11010','00100','01011','10011','00000','00000'],'?':['01110','10001','00010','00100','00100','00000','00100'],'!':['00100','00100','00100','00100','00100','00000','00100']
};
function text(s,x,y,scale=4,c=ink,spacing=1) {
  s=String(s).toUpperCase(); let ox=x;
  for (const ch of s) { if(ch===' '){x+=6*scale;continue;} const g=glyphs[ch]||glyphs['?'];
    for(let r=0;r<7;r++) for(let q=0;q<5;q++) if(g[r][q]==='1') rect(x+q*scale,y+r*scale,scale,scale,c);
    x+= (5+spacing)*scale;
  } return x-ox;
}
function centered(s,y,scale,c) { const width=[...s].reduce((n,ch)=>n+(ch===' '?6:6)*scale,0); text(s,Math.floor((W-width)/2),y,scale,c); }
function rule(x,y,w,c=ink) { rect(x,y,w,3,c); }
function circle(cx,cy,r,c) { for(let y=-r;y<=r;y++) for(let x=-r;x<=r;x++) if(x*x+y*y<=r*r) rect(cx+x,cy+y,1,1,c); }
function border(x,y,w,h,c=ink) { rect(x,y,w,5,c); rect(x,y+h-5,w,5,c); rect(x,y,5,h,c); rect(x+w-5,y,5,h,c); }

// Masthead: a compact, high-contrast newspaper identity.
rect(0,0,W,150,navy); rect(0,145,W,10,red);
text('THE WORLD / ONE DAY',38,28,5,[255,247,224]);
text('MONDAY, 23 NOVEMBER 2026',42,86,4,gold);
rule(38,132,948,[255,247,224]);

const panels=[
 {x:28,y:180,w:468,h:252,bg:[218,232,220],accent:teal,tag:'01 CLIMATE',title:['COP31 ENDS','WITH NO DEAL']},
 {x:528,y:180,w:468,h:252,bg:[224,231,240],accent:blue,tag:'02 MEDITERRANEAN',title:['UKRAINE SINKS','RUSSIAN WARSHIP']},
 {x:28,y:460,w:468,h:252,bg:[238,220,205],accent:rust,tag:'03 UKRAINE',title:['RUSSIAN STRIKES','KILL 15 NEAR KYIV']},
 {x:528,y:460,w:468,h:252,bg:[244,222,178],accent:red,tag:'04 MIDDLE EAST',title:['IRAN HITS U.S.','BASE IN BAHRAIN']},
 {x:28,y:740,w:968,h:252,bg:[225,224,213],accent:gold,tag:'05 TECHNOLOGY',title:['NVIDIA BRINGS BACK','JENSEN HUANG']}
];
for(const p of panels){ rect(p.x,p.y,p.w,p.h,p.bg); border(p.x,p.y,p.w,p.h,ink); rect(p.x+5,p.y+5, p.w-10,34,p.accent); text(p.tag,p.x+20,p.y+14,3,paper); text(p.title[0],p.x+22,p.y+57,4,ink); text(p.title[1],p.x+22,p.y+88,4,ink); }
// Globe icon
let p=panels[0]; circle(p.x+365,p.y+142,61,teal); circle(p.x+365,p.y+142,51,[218,232,220]); // globe interior
for(let a=-40;a<=40;a+=20) line(p.x+365+a,p.y+91,p.x+365+a/2,p.y+193,teal,3); line(p.x+306,p.y+142,p.x+424,p.y+142,teal,3); line(p.x+315,p.y+116,p.x+415,p.y+116,teal,2); line(p.x+315,p.y+168,p.x+415,p.y+168,teal,2);
text('ANTALYA / TURKEY',p.x+22,p.y+202,3,teal); text('EU REJECTS FOSSIL-FUEL OMISSION',p.x+22,p.y+225,2,ink);
// Ship and drone icon
p=panels[1]; line(p.x+306,p.y+181,p.x+427,p.y+181,blue,5); line(p.x+325,p.y+177,p.x+345,p.y+139,blue,4); line(p.x+345,p.y+139,p.x+375,p.y+139,blue,4); line(p.x+375,p.y+139,p.x+400,p.y+177,blue,4); line(p.x+350,p.y+139,p.x+350,p.y+115,blue,4); line(p.x+350,p.y+117,p.x+393,p.y+117,blue,4); line(p.x+393,p.y+117,p.x+393,p.y+130,blue,4); circle(p.x+395,p.y+96,7,red); line(p.x+385,p.y+87,p.x+408,p.y+104,red,3); line(p.x+408,p.y+87,p.x+385,p.y+104,red,3); text('BENGHAZI / LIBYA',p.x+22,p.y+202,3,blue); text('7 SEA DRONES / CORVET MERCURY',p.x+22,p.y+225,2,ink);
// Ruined house
p=panels[2]; line(p.x+300,p.y+188,p.x+430,p.y+188,rust,5); line(p.x+315,p.y+188,p.x+315,p.y+137,rust,5); line(p.x+315,p.y+137,p.x+360,p.y+105,rust,5); line(p.x+360,p.y+105,p.x+402,p.y+137,rust,5); line(p.x+402,p.y+137,p.x+402,p.y+188,rust,5); rect(p.x+342,p.y+158,24,30,rust); line(p.x+322,p.y+153,p.x+345,p.y+178,red,4); line(p.x+345,p.y+153,p.x+322,p.y+178,red,4); circle(p.x+377,p.y+129,8,gold); text('DYMER / NEAR KYIV',p.x+22,p.y+202,3,rust); text('BOY FOUND ALIVE IN RUBBLE',p.x+22,p.y+225,2,ink);
// Fire and oil drop
p=panels[3];
for(let i=0;i<3;i++){ circle(p.x+338+i*27,p.y+159,22-i*4, i===1?gold:red); }
line(p.x+327,p.y+183,p.x+410,p.y+183,red,5); line(p.x+344,p.y+169,p.x+349,p.y+119,red,5); line(p.x+375,p.y+171,p.x+386,p.y+130,gold,5); line(p.x+407,p.y+179,p.x+425,p.y+142,red,5); circle(p.x+430,p.y+116,18,navy); line(p.x+430,p.y+99,p.x+430,p.y+130,navy,2); text('BAHRAIN / HORMUZ',p.x+22,p.y+202,3,red); text('MISSILES / DRONES / TANKERS BURN',p.x+22,p.y+225,2,ink);
// Nvidia chip
p=panels[4]; const cx=p.x+760,cy=p.y+154; rect(cx-55,cy-55,110,110,gold); rect(cx-38,cy-38,76,76,navy); for(let i=-40;i<=40;i+=20){line(cx+i,cy-72,cx+i,cy-55,gold,6);line(cx+i,cy+55,cx+i,cy+72,gold,6);line(cx-72,cy+i,cx-55,cy+i,gold,6);line(cx+55,cy+i,cx+72,cy+i,gold,6);} text('N',cx-15,cy-24,6,gold); text('11 DAYS AFTER EXIT',p.x+22,p.y+202,3,gold); text('SHARES SURGE / CEO RETURNS',p.x+22,p.y+225,2,ink);

// Deterministic PNG writer.
function crc32(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type);const out=Buffer.alloc(12+data.length);out.writeUInt32BE(data.length,0);t.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([t,data])),8+data.length);return out;}
const rows=[]; for(let y=0;y<H;y++){rows.push(Buffer.from([0])); rows.push(pix.subarray(y*W*4,(y+1)*W*4));}
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',(()=>{const b=Buffer.alloc(13);b.writeUInt32BE(W,0);b.writeUInt32BE(H,4);b[8]=8;b[9]=6;return b;})()),chunk('IDAT',deflateSync(Buffer.concat(rows),{level:9})),chunk('IEND',Buffer.alloc(0))]);
const out=process.env.MAKEFUN_OUTPUT_DIR||'/output'; mkdirSync(out,{recursive:true}); writeFileSync(out+'/entry.png',png);
