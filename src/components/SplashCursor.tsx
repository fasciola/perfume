import React, { useEffect, useRef } from 'react';

interface SplashCursorProps {
  color?: string; // Hex color code
}

export default function SplashCursor({ color = '#c9a66b' }: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024,
      DENSITY_DISSIPATION: 3.2,
      VELOCITY_DISSIPATION: 2.0,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 20,
      CURL: 4,
      SPLAT_RADIUS: 0.18,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLOR: color
    };

    function hexToRGB(hex: string) {
      let value = hex.replace('#', '');
      if (value.length === 3) {
        value = value.split('').map(x => x + x).join('');
      }
      return {
        r: (parseInt(value.substring(0, 2), 16) / 255) * 0.18,
        g: (parseInt(value.substring(2, 4), 16) / 255) * 0.18,
        b: (parseInt(value.substring(4, 6), 16) / 255) * 0.18
      };
    }

    const pointers = [{
      id: -1,
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      moved: false,
      color: hexToRGB(config.COLOR)
    }];

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false
    });

    if (!gl) {
      console.warn('WebGL2 is not supported in this browser.');
      return;
    }

    gl.getExtension('EXT_color_buffer_float');
    const supportLinearFiltering = gl.getExtension('OES_texture_float_linear');

    const ext = {
      halfFloatTexType: gl.HALF_FLOAT,
      formatRGBA: { internalFormat: gl.RGBA16F, format: gl.RGBA },
      formatRG: { internalFormat: gl.RG16F, format: gl.RG },
      formatR: { internalFormat: gl.R16F, format: gl.RED },
      supportLinearFiltering
    };

    function compileShader(type: number, source: string, keywords: string[] = []) {
      const finalSource = keywords.map(k => `#define ${k}`).join('\n') + '\n' + source;
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, finalSource);
      gl!.compileShader(shader);

      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(shader));
      }
      return shader;
    }

    const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `);

    const copyShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;

      void main () {
        gl_FragColor = texture2D(uTexture, vUv);
      }
    `);

    const clearShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;

      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `);

    const displayShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;

      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;

        #ifdef SHADING
          vec3 lc = texture2D(uTexture, vL).rgb;
          vec3 rc = texture2D(uTexture, vR).rgb;
          vec3 tc = texture2D(uTexture, vT).rgb;
          vec3 bc = texture2D(uTexture, vB).rgb;

          float dx = length(rc) - length(lc);
          float dy = length(tc) - length(bc);

          vec3 n = normalize(vec3(dx, dy, length(texelSize)));
          vec3 l = vec3(0.0, 0.0, 1.0);

          float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
          c *= diffuse;
        #endif

        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }
    `, config.SHADING ? ['SHADING'] : []);

    const splatShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;

      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `);

    const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;

      void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }
    `);

    const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;

        if (vL.x < 0.0) L = -C.x;
        if (vR.x > 1.0) R = -C.x;
        if (vT.y > 1.0) T = -C.y;
        if (vB.y < 0.0) B = -C.y;

        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `);

    const curlShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `);

    const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;

      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);

        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;

      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `);

    const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);

        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    if (
      !baseVertexShader || !copyShader || !clearShader || !displayShader ||
      !splatShader || !advectionShader || !divergenceShader || !curlShader ||
      !vorticityShader || !pressureShader || !gradientSubtractShader
    ) {
      return;
    }

    function createProgram(vs: WebGLShader, fs: WebGLShader) {
      const program = gl!.createProgram();
      if (!program) return null;
      gl!.attachShader(program, vs);
      gl!.attachShader(program, fs);
      gl!.bindAttribLocation(program, 0, 'aPosition');
      gl!.linkProgram(program);

      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
        console.error(gl!.getProgramInfoLog(program));
      }
      return program;
    }

    function getUniforms(program: WebGLProgram) {
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS);

      for (let i = 0; i < count; i++) {
        const info = gl!.getActiveUniform(program, i);
        if (info) {
          uniforms[info.name] = gl!.getUniformLocation(program, info.name);
        }
      }
      return uniforms;
    }

    class Program {
      program: WebGLProgram | null;
      uniforms: Record<string, WebGLUniformLocation | null>;
      constructor(vs: WebGLShader, fs: WebGLShader) {
        this.program = createProgram(vs, fs);
        this.uniforms = this.program ? getUniforms(this.program) : {};
      }
      bind() {
        if (this.program) gl!.useProgram(this.program);
      }
    }

    const copyProgram = new Program(baseVertexShader, copyShader);
    const clearProgram = new Program(baseVertexShader, clearShader);
    const displayProgram = new Program(baseVertexShader, displayShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradientSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

    // Set up geometry buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      -1, 1,
      1, 1,
      1, -1
    ]), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
      0, 1, 2,
      0, 2, 3
    ]), gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    const blit = (target: any) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    interface FBO {
      texture: WebGLTexture | null;
      fbo: WebGLFramebuffer | null;
      width: number;
      height: number;
      texelSizeX: number;
      texelSizeY: number;
      attach: (id: number) => number;
    }

    interface DoubleFBO {
      width: number;
      height: number;
      texelSizeX: number;
      texelSizeY: number;
      read: FBO;
      write: FBO;
      swap: () => void;
    }

    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergence: FBO;
    let curl: FBO;
    let pressure: DoubleFBO;

    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
      gl!.activeTexture(gl!.TEXTURE0);
      const texture = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, param);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, param);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

      const fbo = gl!.createFramebuffer();
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
      gl!.viewport(0, 0, w, h);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        attach(id: number) {
          gl!.activeTexture(gl!.TEXTURE0 + id);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          return id;
        }
      };
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
      const fbo1 = createFBO(w, h, internalFormat, format, type, param);
      const fbo2 = createFBO(w, h, internalFormat, format, type, param);

      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        read: fbo1,
        write: fbo2,
        swap() {
          const temp = this.read;
          this.read = this.write;
          this.write = temp;
        }
      };
    }

    function getResolution(resolution: number) {
      const w = gl!.drawingBufferWidth;
      const h = gl!.drawingBufferHeight;
      const aspectRatio = w / h;
      const aspect = aspectRatio < 1 ? 1 / aspectRatio : aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspect);

      if (w > h) return { width: max, height: min };
      return { width: min, height: max };
    }

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);
      const texType = ext.halfFloatTexType;
      const filtering = ext.supportLinearFiltering ? gl!.LINEAR : gl!.NEAREST;

      dye = createDoubleFBO(
        dyeRes.width,
        dyeRes.height,
        ext.formatRGBA.internalFormat,
        ext.formatRGBA.format,
        texType,
        filtering
      );

      velocity = createDoubleFBO(
        simRes.width,
        simRes.height,
        ext.formatRG.internalFormat,
        ext.formatRG.format,
        texType,
        filtering
      );

      divergence = createFBO(
        simRes.width,
        simRes.height,
        ext.formatR.internalFormat,
        ext.formatR.format,
        texType,
        gl!.NEAREST
      );

      curl = createFBO(
        simRes.width,
        simRes.height,
        ext.formatR.internalFormat,
        ext.formatR.format,
        texType,
        gl!.NEAREST
      );

      pressure = createDoubleFBO(
        simRes.width,
        simRes.height,
        ext.formatR.internalFormat,
        ext.formatR.format,
        texType,
        gl!.NEAREST
      );
    }

    function resizeCanvas() {
      if (!canvas) return;
      const width = Math.floor(canvas.clientWidth * window.devicePixelRatio);
      const height = Math.floor(canvas.clientHeight * window.devicePixelRatio);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        initFramebuffers();
      }
    }

    function splat(x: number, y: number, dx: number, dy: number, splatColor: any) {
      splatProgram.bind();

      gl!.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      gl!.uniform1f(splatProgram.uniforms.aspectRatio, canvas!.width / canvas!.height);
      gl!.uniform2f(splatProgram.uniforms.point, x, y);
      gl!.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
      gl!.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100));

      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      gl!.uniform3f(splatProgram.uniforms.color, splatColor.r, splatColor.g, splatColor.b);

      blit(dye.write);
      dye.swap();
    }

    function correctRadius(radius: number) {
      const aspectRatio = canvas!.width / canvas!.height;
      if (aspectRatio > 1) radius *= aspectRatio;
      return radius;
    }

    function step(dt: number) {
      gl!.disable(gl!.BLEND);

      curlProgram.bind();
      gl!.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);

      vorticityProgram.bind();
      gl!.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      gl!.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      gl!.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      divergenceProgram.bind();
      gl!.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      clearProgram.bind();
      gl!.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      gl!.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      blit(pressure.write);
      pressure.swap();

      pressureProgram.bind();
      gl!.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));

      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      gradientSubtractProgram.bind();
      gl!.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
      gl!.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      advectionProgram.bind();
      gl!.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);

      const velocityId = velocity.read.attach(0);
      gl!.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
      gl!.uniform1i(advectionProgram.uniforms.uSource, velocityId);
      gl!.uniform1f(advectionProgram.uniforms.dt, dt);
      gl!.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      gl!.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function render() {
      gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.enable(gl!.BLEND);

      displayProgram.bind();
      gl!.uniform2f(
        displayProgram.uniforms.texelSize,
        1 / gl!.drawingBufferWidth,
        1 / gl!.drawingBufferHeight
      );

      gl!.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    function updatePointerMove(x: number, y: number) {
      const pointer = pointers[0];

      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;

      pointer.texcoordX = x / canvas!.width;
      pointer.texcoordY = 1 - y / canvas!.height;

      pointer.deltaX = pointer.texcoordX - pointer.prevTexcoordX;
      pointer.deltaY = pointer.texcoordY - pointer.prevTexcoordY;

      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
      pointer.color = hexToRGB(config.COLOR);
    }

    function applyInputs() {
      const pointer = pointers[0];
      if (pointer.moved) {
        pointer.moved = false;
        splat(
          pointer.texcoordX,
          pointer.texcoordY,
          pointer.deltaX * config.SPLAT_FORCE,
          pointer.deltaY * config.SPLAT_FORCE,
          pointer.color
        );
      }
    }

    let lastTime = Date.now();
    let animationId: number;

    function update() {
      resizeCanvas();

      const now = Date.now();
      let dt = (now - lastTime) / 1000;
      dt = Math.min(dt, 0.016666);
      lastTime = now;

      applyInputs();
      step(dt);
      render();

      animationId = requestAnimationFrame(update);
    }

    const handleMouseMove = (e: MouseEvent) => {
      updatePointerMove(
        e.clientX * window.devicePixelRatio,
        e.clientY * window.devicePixelRatio
      );
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        updatePointerMove(
          touch.clientX * window.devicePixelRatio,
          touch.clientY * window.devicePixelRatio
        );
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    resizeCanvas();
    initFramebuffers();
    update();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationId);
      // Clean up buffers
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(indexBuffer);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      id="fluid"
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
