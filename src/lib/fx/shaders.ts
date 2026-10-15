/*
 * GLSL for the two WebGL2 programs on the page, plus the palettes that feed
 * them. Plain strings with no browser imports, so scripts/build-og.mjs can
 * render the same hero into the social card.
 */

export interface Palette {
	name: string;
	c: [string, string, string];
}

/** The first one is the site's own: the orange, violet and teal of the old
    hero, now three accents the whole page is lit with. */
export const PALETTES: Palette[] = [
	{ name: 'Signal', c: ['#ff6b35', '#9d7bff', '#5eead4'] },
	{ name: 'Prism', c: ['#7c9cff', '#ff7ad9', '#7dffcf'] },
	{ name: 'Acid', c: ['#b8ff3d', '#2ee6a6', '#3dbbff'] },
	{ name: 'Chrome', c: ['#c9cbd6', '#7f8396', '#ffffff'] }
];

export const hex2rgb = (h: string): [number, number, number] => [
	parseInt(h.slice(1, 3), 16) / 255,
	parseInt(h.slice(3, 5), 16) / 255,
	parseInt(h.slice(5, 7), 16) / 255
];

/** A cyclic blend through the three palette colours. */
const TRI = `
vec3 tri(float t){t=fract(t)*3.;vec3 c=mix(A,B,smoothstep(0.,1.,t));c=mix(c,C,smoothstep(1.,2.,t));return mix(c,A,smoothstep(2.,3.,t));}`;

/** One triangle that covers the screen; no vertex buffer needed. */
export const VS_QUAD = `#version 300 es
void main(){ vec2 p=vec2((gl_VertexID<<1)&2, gl_VertexID&2); gl_Position=vec4(p*2.-1.,0.,1.); }`;

/**
 * Hero: six metaballs and the cursor's own, raymarched as one smooth SDF and
 * shaded as iridescent chrome against a procedural studio environment.
 */
export const FS_HERO = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime, uScroll, uCam; uniform vec3 uMouse, uA, uB, uC;
out vec4 o;
vec3 A, B, C;
${TRI}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float map(vec3 p){
  float t=uTime*.32, ax=clamp(uRes.x/uRes.y/1.7,.42,1.), sp=1.+uScroll*1.5;
  float d=length(p-uMouse)-.36;
  for(int i=0;i<6;i++){
    float f=float(i);
    vec3 c=vec3(sin(t*(.9+f*.17)+f*1.9)*1.3*ax+.6*ax, cos(t*(.7+f*.13)+f*2.7)*.62, sin(t*(.5+f*.07)+f*1.3)*.7)*sp;
    d=smin(d,length(p-c)-(.3+.09*sin(f*2.3+t*1.7))*mix(.8,1.,ax),.62);
  }
  return d+.012*sin(p.x*8.+uTime*1.2)*sin(p.y*8.-uTime)*sin(p.z*8.+uTime*.7);
}
vec3 nrm(vec3 p){const vec2 k=vec2(1,-1);const float h=.002;
  return normalize(k.xyy*map(p+k.xyy*h)+k.yyx*map(p+k.yyx*h)+k.yxy*map(p+k.yxy*h)+k.xxx*map(p+k.xxx*h));}
vec3 env(vec3 r){
  vec3 c=vec3(.01,.01,.016)+vec3(.04,.045,.07)*smoothstep(-.5,1.,r.y);
  c+=vec3(2.2)*smoothstep(.955,.99,sin(r.x*2.4+.8))*smoothstep(0.,.6,r.y);
  c+=tri(.05)*2.4*pow(max(dot(r,normalize(vec3(-.8,.55,.45))),0.),14.);
  c+=tri(.4)*2.*pow(max(dot(r,normalize(vec3(.95,-.1,.35))),0.),10.);
  c+=tri(.72)*1.4*pow(max(dot(r,normalize(vec3(.1,-.95,.3))),0.),6.);
  return c;
}
void main(){
  A=pow(uA,vec3(2.2)); B=pow(uB,vec3(2.2)); C=pow(uC,vec3(2.2));
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec3 ro=vec3(0,0,uCam), rd=normalize(vec3(uv,-1.6));
  float t=0., d=1., md=9., tm=0.;
  for(int i=0;i<64;i++){ d=map(ro+rd*t); if(d<md){md=d;tm=t;} if(d<.001||t>uCam+3.)break; t+=d*.92; }
  vec3 col=vec3(.024,.024,.031);
  col+=pow(tri(uTime*.02+uv.x*.25),vec3(.4545))*.05*smoothstep(1.1,0.,length(uv-vec2(.35,.05)));
  col+=pow(tri(uTime*.03+uv.y*.4),vec3(.4545))*exp(-max(md,0.)*6.)*.26;
  // coverage from the closest approach: a ~2px soft edge instead of stair steps
  float cov=1.-smoothstep(0.,2.*tm/(1.6*uRes.y),md);
  if(cov>0.){
    vec3 p=ro+rd*tm, n=nrm(p), r=reflect(rd,n);
    float fr=pow(1.-max(dot(n,-rd),0.),2.2);
    vec3 ir=tri(fr*.85+n.y*.22+n.x*.12+uTime*.025);
    vec3 s=env(r)*mix(vec3(.6),ir,.7)+ir*fr*.75;
    s=1.-exp(-s*1.25);
    col=mix(col,pow(s,vec3(.4545)),cov);
  }
  col*=mix(1.,smoothstep(1.35,.25,length(uv)),.55);
  col*=1.-uScroll*.85;
  o=vec4(col,1.);
}`;

/**
 * Particles: every point carries four destinations; the vertex shader picks
 * where it is between two of them, each point on its own delay, with
 * turbulence that peaks halfway. Once landed, the tags in aK keep each shape
 * alive (see shapes.ts): the stack breathes and data climbs its risers, the
 * lens drifts over the bug, the exhaust streams and stars rush past.
 */
export const VS_PTS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aP0; layout(location=1) in vec3 aP1;
layout(location=2) in vec3 aP2; layout(location=3) in vec3 aP3;
layout(location=4) in float aR; layout(location=5) in vec4 aK;
uniform float uMorph, uTime, uSize, uAsp, uFit, uTilt, uSpin;
uniform vec3 uA, uB, uC;
out vec3 vCol; out float vA;
vec3 A, B, C;
float heat=0., fade=1.;
const float NOZ=-.62;
${TRI}
vec3 build(){
  float b=.5+.5*sin(uTime*.8);
  if(aK.y>3.5){ float h=1.14+.21*b; return vec3(aP1.x,-h+fract(aP1.z+uTime*.16)*2.*h,aP1.y); }
  return aP1+vec3(0.,(aK.y-1.5)*.14*b,0.);
}
vec3 test(){ return aP2+aK.z*vec3(sin(uTime*.6)*.12,sin(uTime*.95)*.08,0.); }
vec3 ship(){
  if(aK.w<.5) return aP3;
  if(aK.w<1.5){
    float ph=fract(aP3.z+uTime*.55), r=(.2+ph*.5)*aP3.y, a=aP3.x+ph*2.;
    heat=(1.-ph)*(1.-.6*aP3.y); fade=1.-ph;
    return vec3(cos(a)*r,NOZ-ph*1.6,sin(a)*r);
  }
  float ph=fract(aP3.z+uTime*.16);
  fade=.6*sin(ph*3.14159265);
  return vec3(aP3.x,2.8-ph*5.6,aP3.y);
}
vec3 shape(float i){ return i<.5?aP0:i<1.5?build():i<2.5?test():ship(); }
void main(){
  A=uA; B=uB; C=uC;
  float m=clamp(uMorph,0.,3.), i0=min(floor(m),2.), f=m-i0;
  float st=clamp((f-aR*.35)/.65,0.,1.); st=st*st*(3.-2.*st);
  vec3 p=mix(shape(i0),shape(i0+1.),st);
  float s0=i0<.5?1.-st:0., s3=i0>1.5?st:0.;
  float k=sin(st*3.14159265);
  p+=k*.55*vec3(sin(aR*91.+uTime*.9+p.y*1.7),cos(aR*57.+uTime*.7+p.z*1.9),sin(aR*33.+uTime*1.1+p.x*1.5));
  p+=.02*vec3(sin(uTime*1.3+aR*40.),cos(uTime*1.1+aR*30.),sin(uTime*.9+aR*20.));
  float cs=cos(uSpin), sn=sin(uSpin); p.xz=mat2(cs,-sn,sn,cs)*p.xz;
  float ct=cos(uTilt), stt=sin(uTilt); p.yz=mat2(ct,-stt,stt,ct)*p.yz;
  p*=uFit; p.y+=.22;
  float z=5.-p.z;
  gl_Position=vec4(p.x*1.9/uAsp, p.y*1.9, 0., z);
  gl_PointSize=uSize*(.55+aR*.95)/z;
  vec3 c=tri(aR*.4+p.y*.12+uMorph*.22+uTime*.03);
  c=mix(c,vec3(1.),.6*aK.x*s0);
  c=mix(c,vec3(1.,.95,.88),.85*heat*heat*s3);
  vCol=c;
  vA=(.5+.5*k)*smoothstep(9.,3.6,z)*mix(1.,fade,s3);
}`;

export const FS_PTS = `#version 300 es
precision highp float;
in vec3 vCol; in float vA; out vec4 o;
void main(){ vec2 c=gl_PointCoord-.5; float d=dot(c,c)*4.; if(d>1.)discard; float a=1.-d; a*=a; o=vec4(vCol*a*vA,1.); }`;
