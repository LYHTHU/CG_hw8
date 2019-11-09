"use strict"

////////////////////////////// MATRIX SUPPORT
let dot = (a, b) => {
    let value = 0;
    for (let i = 0 ; i < a.length ; i++)
       value += a[i] * b[i];
    return value;
 }
 
 let add = (a, b) => {
     let c = [];
     for (let i = 0; i < a.length; i++)
         c.push(a[i] + b[i]);
     return c;
 }
 
 let subtract = (a,b) => {
    let c = [];
    for (let i = 0 ; i < a.length ; i++)
       c.push(a[i] - b[i]);
    return c;
 }
 
 let multVecScale = (a, vec) => {
     let c = [];
     for (let i = 0; i < vec.length; i++)
         c.push(vec[i] * a);
     return c;
 }
 
 let normalize = a => {
    let s = Math.sqrt(dot(a, a)), b = [];
    for (let i = 0 ; i < a.length ; i++)
       b.push(a[i] / s);
    return b;
 }
 
 let cross = (a, b) => [ a[1] * b[2] - a[2] * b[1],
                         a[2] * b[0] - a[0] * b[2],
                         a[0] * b[1] - a[1] * b[0] ];
 

let cos = t => Math.cos(t);
let sin = t => Math.sin(t);
let identity = ()       => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
let rotateX = t         => [1,0,0,0, 0,cos(t),sin(t),0, 0,-sin(t),cos(t),0, 0,0,0,1];
let rotateY = t         => [cos(t),0,-sin(t),0, 0,1,0,0, sin(t),0,cos(t),0, 0,0,0,1];
let rotateZ = t         => [cos(t),sin(t),0,0, -sin(t),cos(t),0,0, 0,0,1,0, 0,0,0,1];
let scale = (x,y,z)     => [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1];
let translate = (x,y,z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
let multiply = (a, b)   => {
   let c = [];
   for (let n = 0 ; n < 16 ; n++)
      c.push( a[n&3     ] * b[    n&12] +
              a[n&3 |  4] * b[1 | n&12] +
              a[n&3 |  8] * b[2 | n&12] +
              a[n&3 | 12] * b[3 | n&12] );
   return c;
}

let Matrix = function() {
   let topIndex = 0,
       stack = [ identity() ],
       getVal = () => stack[topIndex],
       setVal = m => stack[topIndex] = m;

   this.identity  = ()      => setVal(identity());
   this.restore   = ()      => --topIndex;
   this.rotateX   = t       => setVal(multiply(getVal(), rotateX(t)));
   this.rotateY   = t       => setVal(multiply(getVal(), rotateY(t)));
   this.rotateZ   = t       => setVal(multiply(getVal(), rotateZ(t)));
   this.save      = ()      => stack[++topIndex] = stack[topIndex-1].slice();
   this.scale     = (x,y,z) => setVal(multiply(getVal(), scale(x,y,z)));
   this.translate = (x,y,z) => setVal(multiply(getVal(), translate(x,y,z)));
   this.value     = ()      => getVal();
}

////////////////////////////// SUPPORT FOR CREATING 3D SHAPES

const VERTEX_SIZE = 8;

let createCubeVertices = () => {
   let V = [], P = [ -1,-1, 1, 0,0, 1, 0,0,   1, 1, 1, 0,0, 1, 1,1,  -1, 1, 1, 0,1, 1, 0,1,
                      1, 1, 1, 0,0, 1, 1,1,  -1,-1, 1, 0,0, 1, 0,0,   1,-1, 1, 0,0, 1, 1,0,
                      1, 1,-1, 0,0,-1, 0,0,  -1,-1,-1, 0,0,-1, 1,1,  -1, 1,-1, 0,0,-1, 1,0,
                     -1,-1,-1, 0,0,-1, 1,1,   1, 1,-1, 0,0,-1, 0,0,   1,-1,-1, 0,0,-1, 0,1 ];
   for (let n = 0 ; n < 3 ; n++)
      for (let i = 0 ; i < P.length ; i += 8) {
         let p0 = [P[i],P[i+1],P[i+2]], p1 = [P[i+3],P[i+4],P[i+5]], uv = [P[i+6],P[i+7]];
	 V = V.concat(p0).concat(p1).concat(uv);
	 for (let j = 0 ; j < 3 ; j++) {
	    P[i   + j] = p0[(j+1) % 3];
	    P[i+3 + j] = p1[(j+1) % 3];
         }
      }
   return V;
}

function sphere(u, v) { 
    let theta = 2*Math.PI*u
    let phi = Math.PI*v - Math.PI/2

    let x = Math.cos(theta)*Math.cos(phi)
    let y = Math.sin(theta)*Math.cos(phi)
    let z = Math.sin(phi)
    return [x, y, z, x, y, z, u, v]
}

function torus(u, v) {
    let theta = 2*Math.PI*u;
    let phi = 2*Math.PI*v;

    let r = 0.2;

    let x =Math.cos(theta)*(1 + r*Math.cos(phi));
    let y =Math.sin(theta)*(1 + r*Math.cos(phi));
    let z = r*Math.sin(phi);

    let nx =Math.cos(theta)*Math.cos(phi);
    let ny =Math.sin(theta)*Math.cos(phi);
    let nz =Math.sin(phi);

    return [x,y,z, nx,ny,nz, u, v];
}

function openTube(u, v) { 
    theta = 2*Math.PI*u;
    x = cos(theta);
    y = sin(theta);
    z = 2*v - 1;
    return [x,y,z, x,y,0, u, v];
}

function cylinder(u, v) {
    let c = Math.cos(2*Math.PI*u);
    let s = Math.sin(2*Math.PI*u);
    let z = Math.max(-1, Math.min(1, 10*v - 5));
    
    switch (Math.floor(5.001 * v)) {
        case 0: case 5: return [ 0,0,z, 0,0,z , u, v]; // center of back/front end cap
        case 1: case 4: return [ c,s,z, 0,0,z , u, v];// perimeter of back/front end cap
        case 2: case 3: return [ c,s,z, c,s,0 , u, v]; // back/front of cylindrical tube
    }
}

function createMesh(M, N, uvToShape, arg) {
    let ret = [];
    if (M == 1 && N == 1) {
        throw "No triangles!";
    }

    let addPoint = (u, v) => {
        let xyz = uvToShape(u, v, arg);
        ret = ret.concat(xyz);
    }

    let dx = 1.0 / (M - 1); 
    let dy = 1.0 / (N - 1);
    // zigzag
    // There are N-1 rows, 1 => N-1
    let num_triangles = 2 * (M - 1);

    for (let r = 1; r < N; r++) {
        let c = 1 - r % 2;
        c = Math.max(c, 0)
        c = Math.min(c, 1)
        let sign = (r % 2 == 1 ? 1 : -1);

        c = 0;
        sign = 1;

        let mdown = (r - 1) * dy, mup = r * dy ;
        for (let t = 0; t < num_triangles; t += 2) {
            if (c > 1) break;
            addPoint(c, mdown);
            addPoint(c, mup);
            c = c + sign * dx ;
            addPoint(c, mdown)
            addPoint(c, mup);
        }
    }
    return ret;
}

let cubeVertices = createCubeVertices();
let sphereV = createMesh(30, 30, sphere);
let torusV = createMesh(30, 30, torus);
let cylinderV = createMesh(30, 30, cylinder);
////////////////////////////// SCENE SPECIFIC CODE

async function setup(state) {
    hotReloadFile(getPath('week8.js'));

    state.cubeVertices = cubeVertices;
    state.sphereV = sphereV;
    state.torusV = torusV;
    state.cylinderV = cylinderV;

    const images = await imgutil.loadImagesPromise([
       getPath("textures/brick.png"),
       getPath("textures/tiles.jpg"),
    ]);

    let libSources = await MREditor.loadAndRegisterShaderLibrariesForLiveEditing(gl, "libs", [
        { key : "pnoise"    , path : "shaders/noise.glsl"     , foldDefault : true },
        { key : "sharedlib1", path : "shaders/sharedlib1.glsl", foldDefault : true },      
    ]);
    if (! libSources)
        throw new Error("Could not load shader library");

    // load vertex and fragment shaders from the server, register with the editor
    let shaderSource = await MREditor.loadAndRegisterShaderForLiveEditing(
        gl,
        "mainShader",
        { 
            onNeedsCompilation : (args, libMap, userData) => {
                const stages = [args.vertex, args.fragment];
                const output = [args.vertex, args.fragment];
                const implicitNoiseInclude = true;
                if (implicitNoiseInclude) {
                    let libCode = MREditor.libMap.get('pnoise');
                    for (let i = 0; i < 2; i++) {
                        const stageCode = stages[i];
                        const hdrEndIdx = stageCode.indexOf(';');
                        const hdr = stageCode.substring(0, hdrEndIdx + 1);
                        output[i] = hdr + '\n#line 2 1\n' + 
                                    '#include<pnoise>\n#line ' + (hdr.split('\n').length + 1) + ' 0' + 
                                    stageCode.substring(hdrEndIdx + 1);
                    }
                }
                MREditor.preprocessAndCreateShaderProgramFromStringsAndHandleErrors(
                    output[0],
                    output[1],
                    libMap
                );
            },
            onAfterCompilation : (program) => {
                gl.useProgram(state.program = program);
                state.uColorLoc    = gl.getUniformLocation(program, 'uColor');
                state.uCursorLoc   = gl.getUniformLocation(program, 'uCursor');
                state.uModelLoc    = gl.getUniformLocation(program, 'uModel');
                state.uProjLoc     = gl.getUniformLocation(program, 'uProj');
                state.uTexIndexLoc = gl.getUniformLocation(program, 'uTexIndex');
                state.uTimeLoc     = gl.getUniformLocation(program, 'uTime');
                state.uViewLoc     = gl.getUniformLocation(program, 'uView');
		state.uTexLoc = [];
		for (let n = 0 ; n < 8 ; n++) {
		   state.uTexLoc[n] = gl.getUniformLocation(program, 'uTex' + n);
                   gl.uniform1i(state.uTexLoc[n], n);
		}
            } 
        },
        {
            paths : {
                vertex   : "shaders/vertex.vert.glsl",
                fragment : "shaders/fragment.frag.glsl"
            },
            foldDefault : {
                vertex   : true,
                fragment : false
            }
        }
    );
    if (! shaderSource)
        throw new Error("Could not load shader");

    state.cursor = ScreenCursor.trackCursor(MR.getCanvas());

    state.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);

    let bpe = Float32Array.BYTES_PER_ELEMENT;

    let aPos = gl.getAttribLocation(state.program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, bpe * VERTEX_SIZE, bpe * 0);

    let aNor = gl.getAttribLocation(state.program, 'aNor');
    gl.enableVertexAttribArray(aNor);
    gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, bpe * VERTEX_SIZE, bpe * 3);

    let aUV  = gl.getAttribLocation(state.program, 'aUV');
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV , 2, gl.FLOAT, false, bpe * VERTEX_SIZE, bpe * 6);

    for (let i = 0 ; i < images.length ; i++) {
        gl.activeTexture (gl.TEXTURE0 + i);
        gl.bindTexture   (gl.TEXTURE_2D, gl.createTexture());
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D    (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
}

let noise = new ImprovedNoise();
let m = new Matrix();
let turnAngle = 0, cursorPrev = [0,0,0];

function onStartFrame(t, state) {
    if (! state.tStart)
        state.tStart = t;
    state.time = (t - state.tStart) / 1000;

    let cursorValue = () => {
       let p = state.cursor.position(), canvas = MR.getCanvas();
       return [ p[0] / canvas.clientWidth * 2 - 1, 1 - p[1] / canvas.clientHeight * 2, p[2] ];
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let cursorXYZ = cursorValue();
    if (cursorXYZ[2] && cursorPrev[2])
        turnAngle += 2 * (cursorXYZ[0] - cursorPrev[0]);
    cursorPrev = cursorXYZ;

    gl.uniform3fv(state.uCursorLoc     , cursorXYZ);
    gl.uniform1f (state.uTimeLoc       , state.time);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
}

function onDraw(t, projMat, viewMat, state, eyeIdx) {
    gl.uniformMatrix4fv(state.uViewLoc, false, new Float32Array(viewMat));
    gl.uniformMatrix4fv(state.uProjLoc, false, new Float32Array(projMat));

    let drawShape = (color, type, vertices, texture) => {
       gl.uniform3fv(state.uColorLoc, color);
       gl.uniformMatrix4fv(state.uModelLoc, false, m.value());
       gl.uniform1i(state.uTexIndexLoc, texture === undefined ? -1 : texture);
       gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW);
       gl.drawArrays(type, 0, vertices.length / VERTEX_SIZE);
    }

    m.identity();
    m.rotateY(turnAngle);

    // ground
    m.save();
    m.translate(0, -2, 0);
    m.scale(50, 0.05, 50);
    drawShape([1,1,1], gl.TRIANGLES, cubeVertices, 0);
    m.restore();

    // steps
    // m.rotateY(0.2*state.time);



    for(let i = 1; i < 10; i ++) {
        m.save();
            m.translate(0, -2, 0);
            m.scale(0.2, 0.05, 0.1);
            for (let i = 0; i < 10; i++) {
                m.translate(0, 2, -2);
                drawShape([1,1,1], gl.TRIANGLES, cubeVertices, 0);
            }
        m.restore();

        m.save();
            m.rotateY(0.5*Math.PI);
            m.translate(2, -1, 0);
            m.scale(0.2, 0.05, 0.1);
            for (let i = 0; i < 10; i++) {
                m.translate(0, 2, -2);
                drawShape([1,1,1], gl.TRIANGLES, cubeVertices, 0);
            }
        m.restore();

        m.save();
            m.rotateY(Math.PI);
            m.translate(2, 0, 2);
            m.scale(0.2, 0.05, 0.1);
            for (let i = 0; i < 10; i++) {
                m.translate(0, 2, -2);
                drawShape([1,1,1], gl.TRIANGLES, cubeVertices, 0);
            }
        m.restore();

        m.save();
            m.rotateY(-0.5*Math.PI);
            m.translate(0, 1, 2);
            m.scale(0.2, 0.05, 0.1);
            for (let i = 0; i < 10; i++) {
                m.translate(0, 2, -2);
                drawShape([1,1,1], gl.TRIANGLES, cubeVertices, 0);
            }
        m.restore();
        m.translate(0, 4, 0);
    }


    // ladder
    // m.save();
    //     m.scale(0.01, 0.05, 0.01);
    //     m.save();
    //     m.translate(20, 0, 0);
    //     for(let i = 0; i < 10; i++) {
    //         m.translate(0, 2, 0);
    //         drawShape([1,1,1], gl.TRIANGLES, cubeVertices, 0);
    //     }
    //     m.restore();

    //     m.save();
    //     m.translate(-20, 0, 0);
    //     for(let i = 0; i < 10; i++) {
    //         m.translate(0, 2, 0);
    //         drawShape([1,1,1], gl.TRIANGLES, cubeVertices, 0);
    //     }
    //     m.restore();
    // m.restore();
    // m.save();
    //     m.scale(0.2, 0.01, 0.01);
    //     for(let i = 0; i < 10; i++) {
    //         m.translate(0, 10, 0);
    //         drawShape([1,1,1], gl.TRIANGLES, cubeVertices, 0);
    //     }
    // m.restore();

    // for (let z = -3 ; z <= 3 ; z += 2) {
    //     for (let x = -3 ; x <= 3 ; x += 2) {
    //         m.save();
    //             let y = Math.max(Math.abs(x),Math.abs(z)) / 3 - 1 +
    //                 noise.noise(x, 0, 100 * z + state.time / 2) / 5;
    //             m.translate(x, y, z);
    //             m.scale(.3,.3,.3);
    //             drawShape([1,1,1], gl.TRIANGLES, cubeVertices, 0);
    //             m.translate(2, 0, 0);
    //             drawShape([1,1,1], gl.TRIANGLE_STRIP, sphereV, 1);
    //             m.translate(2, 0, 0);
    //             drawShape([1,1,1], gl.TRIANGLE_STRIP, torusV, 0);
    //         m.restore();
    //     }
    // }
}

function onEndFrame(t, state) {}

export default function main() {
    const def = {
        name         : 'week8',
        setup        : setup,
        onStartFrame : onStartFrame,
        onEndFrame   : onEndFrame,
        onDraw       : onDraw,
    };

    return def;
}

