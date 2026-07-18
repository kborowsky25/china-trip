// Self-contained Leaflet map for the home. Clean, light, minimal (CARTO Positron)
// with China-red flight arcs, gold rail/ferry, animated plane/train/boat movers,
// and minimal red pins. RN drives it: window.__play() runs the route fly-through,
// window.__setNativeLocation() drops the live dot. Tapping a city posts to RN.
import { STOPS, COORDS, RAIL_WP } from "./data";

export function buildMapHtml(): string {
  const stops = STOPS.map((s) => ({
    n: s.n,
    name: s.name,
    mapcity: s.mapcity,
    c: s.c,
    dates: s.dates,
    days: s.days,
    cls: s.arrive.cls,
  }));
  const data = JSON.stringify({ C: COORDS, stops, railWP: RAIL_WP });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body,#map{height:100%;width:100%}
  body{background:#f4f5f3;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;overflow:hidden}
  #map{position:absolute;inset:0;background:#eef0ee}
  .maperr{position:absolute;inset:0;display:none;align-items:center;justify-content:center;text-align:center;padding:24px;color:#777;font-size:14px;background:#f4f5f3}
  .pin{width:14px;height:14px;border-radius:50%;background:#DE2910;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.28)}
  .pin.term{width:9px;height:9px;background:#B7BBC2;border-width:2px}
  .pin.gold{background:#E0A400}
  .leaflet-tooltip.citylabel{background:transparent;border:none;box-shadow:none;color:#15171B;font-weight:800;font-size:12.5px;padding:0;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 5px #fff,0 0 5px #fff;letter-spacing:-.2px}
  .leaflet-tooltip.citylabel.term{color:#8A8F98;font-weight:700;font-size:11px}
  .leaflet-tooltip.citylabel:before{display:none}
  .leaflet-popup-content-wrapper{border-radius:14px;box-shadow:0 12px 34px rgba(15,25,45,.18)}
  .leaflet-popup-content{margin:11px 14px;font-size:13px;color:#15171B}
  .leaflet-popup-content b{font-size:14px;font-weight:800}.leaflet-popup-content .pd{color:#8A8F98;font-size:11.5px;margin-top:3px}
  .plane{position:relative;width:60px;height:24px;transform-origin:48px 12px;pointer-events:none}
  .plane .pg{position:absolute;right:0;top:0;width:24px;height:24px;fill:#15171B;filter:drop-shadow(0 1px 2px rgba(0,0,0,.28))}
  .plane .ptrail{position:absolute;top:10px;right:22px;width:40px;height:4px;border-radius:4px;background:linear-gradient(to left,rgba(222,41,16,.85),rgba(222,41,16,0))}
  .mvricon svg{fill:#15171B;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.3))}
  .mvricon{display:flex;align-items:center;justify-content:center}
  .mepulse{width:16px;height:16px;border-radius:50%;background:#DE2910;border:3px solid #fff;box-shadow:0 0 0 rgba(222,41,16,.5);animation:mepulse 1.8s infinite}
  @keyframes mepulse{0%{box-shadow:0 0 0 0 rgba(222,41,16,.5)}70%{box-shadow:0 0 0 16px rgba(222,41,16,0)}100%{box-shadow:0 0 0 0 rgba(222,41,16,0)}}
</style>
</head>
<body>
<div id="map"></div>
<div class="maperr" id="maperr">Map needs a connection.</div>
<script>
var DATA = ${data};
var C = DATA.C, stops = DATA.stops, railWP = DATA.railWP;
function post(o){ if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(o)); }

var SIDE={
  train:'<svg viewBox="0 0 36 16" width="24" height="11"><path fill-rule="evenodd" d="M2 8.2c0-2.6 1.9-4.6 4.6-4.6h13.6c6 0 10 2.3 13 6.4 1 1.4.1 3.2-1.6 3.2H4.1c-1.2 0-2.1-.9-2.1-2.1V8.2zM6 7h13v3H6V7zm15.5 0h3.3c1.5.4 2.8 1.2 3.9 3h-7.2V7z"/></svg>',
  boat:'<svg viewBox="0 0 48 24" width="28" height="14"><path fill-rule="evenodd" d="M14 3h12v4h8v8H8V7h6V3zm-1 6h3v3h-3V9zm5.5 0h3v3h-3V9zm5.5 0h3v3h-3V9zm5.5 0h3v3h-3V9z"/><path d="M5 17h38l-4.5 6H10.5z"/></svg>'
};

function greatCircle(a,b,n){ n=n||72;
  var toR=function(d){return d*Math.PI/180;},toD=function(r){return r*180/Math.PI;};
  var f1=toR(a[0]),l1=toR(a[1]),f2=toR(b[0]),l2=toR(b[1]);
  var x1=Math.cos(f1)*Math.cos(l1),y1=Math.cos(f1)*Math.sin(l1),z1=Math.sin(f1);
  var x2=Math.cos(f2)*Math.cos(l2),y2=Math.cos(f2)*Math.sin(l2),z2=Math.sin(f2);
  var dot=Math.min(1,Math.max(-1,x1*x2+y1*y2+z1*z2));var O=Math.acos(dot);var out=[];
  if(O<1e-6)return[a,b];
  for(var i=0;i<=n;i++){var f=i/n,A=Math.sin((1-f)*O)/Math.sin(O),B=Math.sin(f*O)/Math.sin(O);var x=A*x1+B*x2,y=A*y1+B*y2,z=A*z1+B*z2;out.push([toD(Math.atan2(z,Math.hypot(x,y))),toD(Math.atan2(y,x))]);}
  return out;
}
function smooth(pts,seg){seg=seg||16;if(pts.length<3)return pts;var out=[];
  for(var i=0;i<pts.length-1;i++){var p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
    for(var t=0;t<seg;t++){var u=t/seg,u2=u*u,u3=u2*u;
      out.push([0.5*((2*p1[0])+(-p0[0]+p2[0])*u+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),
                0.5*((2*p1[1])+(-p0[1]+p2[1])*u+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3)]);}}
  out.push(pts[pts.length-1]);return out;}
function segLen(p,q){return Math.hypot(q[1]-p[1],q[0]-p[0]);}
function drawAnim(poly,delay,dur){var p=poly&&poly._path;if(!p||!p.getTotalLength)return;var len;try{len=p.getTotalLength();}catch(e){return;}p.style.transition='none';p.style.strokeDasharray=len;p.style.strokeDashoffset=len;p.getBoundingClientRect();requestAnimationFrame(function(){p.style.transition='stroke-dashoffset '+dur+'ms ease '+delay+'ms';p.style.strokeDashoffset=0;});setTimeout(function(){p.style.transition='';p.style.strokeDasharray='';p.style.strokeDashoffset='';},delay+dur+300);}

var map=null, markers={}, playing=false, playTimer=null;

function initMap(){
  if(typeof L==='undefined')throw new Error('Leaflet not loaded');
  var base=L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png',{attribution:'',subdomains:'abcd',maxZoom:20,keepBuffer:4});
  map=L.map('map',{scrollWheelZoom:true,worldCopyJump:true,layers:[base],zoomSnap:0,zoomDelta:0.5,wheelPxPerZoomLevel:80,wheelDebounceTime:25,zoomControl:false,attributionControl:false}).setView([31,110],4.4);

  var pin=function(cls){return L.divIcon({className:'',html:'<div class="pin '+(cls||'')+'"></div>',iconSize:[14,14],iconAnchor:[7,7],popupAnchor:[0,-8]});};
  stops.forEach(function(s){
    var m=L.marker(s.c,{icon:pin()}).addTo(map);
    m.bindPopup('<b>'+s.n+'. '+s.name+'</b><div class="pd">'+s.dates+' · '+s.days+' days</div>');
    m.bindTooltip(s.name,{permanent:true,direction:'right',offset:[11,0],className:'citylabel'});
    m.on('click',function(){ map.flyTo(s.c,6,{duration:.7}); m.openPopup(); post({type:'stop',n:s.n}); });
    markers[s.n]=m;
  });
  L.marker(C.Macau,{icon:pin('gold')}).addTo(map).bindTooltip("Macau",{permanent:true,direction:'right',offset:[10,0],className:'citylabel'}).bindPopup('<b>Macau</b><div class="pd">Day trip by ferry</div>');
  L.marker(C.CDG,{icon:pin('term')}).addTo(map).bindTooltip("Paris",{permanent:true,direction:'right',offset:[9,0],className:'citylabel term'}).bindPopup('<b>Paris CDG</b><div class="pd">Connecting hub</div>');
  L.marker(C.London,{icon:pin('term')}).addTo(map).bindTooltip("London",{permanent:true,direction:'right',offset:[9,0],className:'citylabel term'}).bindPopup('<b>London</b><div class="pd">Start &amp; finish</div>');

  var sF={color:'#DE2910',weight:2.2,opacity:.9},sR={color:'#C8102E',weight:3,opacity:.85},sFy={color:'#E0A400',weight:2.6,opacity:.95,dashArray:'6,7'};
  var animPaths=[],drawn=[];
  var outbound=greatCircle(C.London,C.CDG,30).concat(greatCircle(C.CDG,C.Beijing,72));
  drawn.push(L.polyline(outbound,sF).addTo(map));animPaths.push({path:outbound,kind:'plane'});
  for(var i=0;i<stops.length-1;i++){var leg=stops[i+1];
    if(leg.cls==='rail'){var p=smooth(railWP[leg.n]);drawn.push(L.polyline(p,sR).addTo(map));animPaths.push({path:p,kind:'train'});}
    else{var pf=greatCircle(stops[i].c,leg.c,72);drawn.push(L.polyline(pf,sF).addTo(map));animPaths.push({path:pf,kind:'plane'});}}
  var ferry=greatCircle(C.HongKong,C.Macau,24);L.polyline(ferry,sFy).addTo(map);animPaths.push({path:ferry,kind:'boat'});
  var inbound=greatCircle(C.HongKong,[20,98],36).concat(greatCircle([20,98],C.CDG,72),greatCircle(C.CDG,C.London,30));
  drawn.push(L.polyline(inbound,sF).addTo(map));animPaths.push({path:inbound,kind:'plane'});

  function makeMover(path,kind){
    var planeIcon=L.divIcon({className:'',html:'<div class="plane"><span class="ptrail"></span><svg class="pg" viewBox="0 0 512 512"><path d="M480 256c0 12.9-10.4 23.3-23.3 23.3l-135.3 0-88.4 132.6c-2.6 3.9-7 6.2-11.6 6.2l-30.6 0c-8 0-13.8-7.7-11.6-15.4L188 279.3l-77.1 0-34.4 45.9c-2.2 2.9-5.6 4.6-9.3 4.6l-23.9 0c-7.9 0-13.7-7.5-11.6-15.1L45.8 256 21.8 197.4c-2.1-7.6 3.7-15.1 11.6-15.1l23.9 0c3.7 0 7.1 1.7 9.3 4.6l34.4 45.9 77.1 0L154.6 105.3c-2.2-7.7 3.6-15.4 11.6-15.4l30.6 0c4.6 0 9 2.3 11.6 6.2l88.4 132.6 135.3 0c12.9 0 23.3 10.4 23.3 23.3z"/></svg></div>',iconSize:[60,24],iconAnchor:[48,12]});
    var moverIcon = kind==='plane' ? planeIcon : L.divIcon({className:'',html:'<div class="mvricon">'+SIDE[kind==='train'?'train':'boat']+'</div>',iconSize:[30,15],iconAnchor:[15,7]});
    var marker=L.marker(path[0],{icon:moverIcon,interactive:false,zIndexOffset:1000}).addTo(map);
    var cum=[0];for(var i=1;i<path.length;i++)cum.push(cum[i-1]+segLen(path[i-1],path[i]));
    var total=cum[cum.length-1]||1,duration=(kind==='train'?9000:kind==='boat'?6000:11000),start=null;
    function frame(ts){if(start===null)start=ts;var d=(((ts-start)%duration)/duration)*total;var i=1;while(i<cum.length&&cum[i]<d)i++;if(i>=path.length)i=path.length-1;var seg=(d-cum[i-1])/((cum[i]-cum[i-1])||1);var lat=path[i-1][0]+(path[i][0]-path[i-1][0])*seg,lng=path[i-1][1]+(path[i][1]-path[i-1][1])*seg;marker.setLatLng([lat,lng]);
      if(kind==='plane'){var dLat=path[i][0]-path[i-1][0],dLng=path[i][1]-path[i-1][1];var ang=Math.atan2(-dLat,dLng)*180/Math.PI;var el=marker.getElement();if(el){var g=el.querySelector('.plane');if(g)g.style.transform='rotate('+ang+'deg)';}}
      else{var el2=marker.getElement();if(el2){var g2=el2.querySelector('.mvricon');if(g2)g2.style.transform=(path[i][1]<path[i-1][1])?'scaleX(-1)':'';}}
      requestAnimationFrame(frame);}
    requestAnimationFrame(frame);
  }
  animPaths.forEach(function(a){makeMover(a.path,a.kind);});

  window.__setNativeLocation=function(lat,lng,acc){if(!map)return;var ll=[lat,lng];if(!window.__loc){window.__loc=L.marker(ll,{icon:L.divIcon({className:'',html:'<div class="mepulse"></div>',iconSize:[18,18],iconAnchor:[9,9]}),interactive:false,zIndexOffset:2000}).addTo(map);window.__acc=L.circle(ll,{radius:acc||50,color:'#DE2910',weight:1,fillColor:'#DE2910',fillOpacity:.1}).addTo(map);map.setView(ll,9);}else{window.__loc.setLatLng(ll);window.__acc.setLatLng(ll).setRadius(acc||50);}};

  window.__fit=function(){ map.fitBounds(stops.map(function(s){return s.c;}).concat([C.Macau]),{padding:[60,60]}); };
  window.__fit();
  var fix=function(){map.invalidateSize();};setTimeout(fix,300);setTimeout(fix,900);
  window.addEventListener('resize',fix);
}

function setPlay(on){playing=on;post({type:'play',on:on});}
window.__play=function(){
  if(!map)return;
  if(playing){clearTimeout(playTimer);setPlay(false);map.closePopup();window.__fit();return;}
  setPlay(true);var i=0;
  function step(){
    if(!playing)return;
    if(i>=stops.length){setPlay(false);map.flyToBounds(stops.map(function(s){return s.c;}).concat([C.Macau]),{padding:[60,60],duration:1.4});return;}
    var s=stops[i];map.flyTo(s.c,6.2,{duration:1.3});if(markers[s.n])markers[s.n].openPopup();i++;playTimer=setTimeout(step,2300);
  }
  map.flyTo(C.Beijing,5,{duration:1});playTimer=setTimeout(step,900);
};

try{ initMap(); }catch(err){ var e=document.getElementById('maperr'); if(e)e.style.display='flex'; }
</script>
</body>
</html>`;
}
