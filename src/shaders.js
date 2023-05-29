import * as THREE from 'three'

// Shaders
window.xs = {
    uniforms: {
        tDiffuse: {
            value: null
        },
        opacity: {
            value: 1
        }
    },
    vertexShader: `
    varying vec2 vUv;

    void main() {

        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }`,
    fragmentShader: `
    uniform float opacity;

    uniform sampler2D tDiffuse;

    varying vec2 vUv;

    void main() {

        gl_FragColor = texture2D( tDiffuse, vUv );
        gl_FragColor.a *= opacity;


    }`
}

window.q9 = {
    shaderID: "luminosityHighPass",
    uniforms: {
        tDiffuse: {
            value: null
        },
        luminosityThreshold: {
            value: 1
        },
        smoothWidth: {
            value: 1
        },
        defaultColor: {
            value: new THREE.Color(0)
        },
        defaultOpacity: {
            value: 0
        }
    },
    vertexShader: `
    varying vec2 vUv;

    void main() {

        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }`,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 defaultColor;
    uniform float defaultOpacity;
    uniform float luminosityThreshold;
    uniform float smoothWidth;

    varying vec2 vUv;

    void main() {

        vec4 texel = texture2D( tDiffuse, vUv );

        vec3 luma = vec3( 0.299, 0.587, 0.114 );

        float v = dot( texel.xyz, luma );

        vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

        float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

        gl_FragColor = mix( outputColor, texel, alpha );

    }`
}

window.sb = {
    uniforms: {
        colorTexture: {
            value: null
        },
        texSize: {
            value: new THREE.Vector2(.5, .5)
        },
        direction: {
            value: new THREE.Vector2(.5, .5)
        }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `
    #include <common>
    varying vec2 vUv;
    uniform sampler2D colorTexture;
    uniform vec2 texSize;
    uniform vec2 direction;

    float gaussianPdf(in float x, in float sigma) {
        return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
    }
    void main() {
        vec2 invSize = 1.0 / texSize;
        float fSigma = float(SIGMA);
        float weightSum = gaussianPdf(0.0, fSigma);
        vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;
        for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
            float x = float(i);
            float w = gaussianPdf(x, fSigma);
            vec2 uvOffset = direction * invSize * x;
            vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;
            vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;
            diffuseSum += (sample1 + sample2) * w;
            weightSum += 2.0 * w;
        }
        gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
    }`
}

window.cp = {
    uniforms: {
        blurTexture1: {
            value: null
        },
        blurTexture2: {
            value: null
        },
        blurTexture3: {
            value: null
        },
        blurTexture4: {
            value: null
        },
        blurTexture5: {
            value: null
        },
        bloomStrength: {
            value: 1
        },
        bloomFactors: {
            value: null
        },
        bloomTintColors: {
            value: null
        },
        bloomRadius: {
            value: 0
        }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D blurTexture1;
    uniform sampler2D blurTexture2;
    uniform sampler2D blurTexture3;
    uniform sampler2D blurTexture4;
    uniform sampler2D blurTexture5;
    uniform float bloomStrength;
    uniform float bloomRadius;
    uniform float bloomFactors[NUM_MIPS];
    uniform vec3 bloomTintColors[NUM_MIPS];

    float lerpBloomFactor(const in float factor) {
        float mirrorFactor = 1.2 - factor;
        return mix(factor, mirrorFactor, bloomRadius);
    }

    void main() {
        gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
            lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
            lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
            lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
            lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
    }`
}

window.Xh = {
    uniforms: {
        tDiffuse: {
            value: null
        },
        resolution: {
            value: new THREE.Vector2(1 / 1024, 1 / 512)
        }
    },
    vertexShader: `
    varying vec2 vUv;

    void main() {

        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }`,
    fragmentShader: `
	precision highp float;

	uniform sampler2D tDiffuse;

	uniform vec2 resolution;

	varying vec2 vUv;

	// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)

	//----------------------------------------------------------------------------------
	// File:        es3-keplerFXAAassetsshaders/FXAA_DefaultES.frag
	// SDK Version: v3.00
	// Email:       gameworks@nvidia.com
	// Site:        http://developer.nvidia.com/
	//
	// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.
	//
	// Redistribution and use in source and binary forms, with or without
	// modification, are permitted provided that the following conditions
	// are met:
	//  * Redistributions of source code must retain the above copyright
	//    notice, this list of conditions and the following disclaimer.
	//  * Redistributions in binary form must reproduce the above copyright
	//    notice, this list of conditions and the following disclaimer in the
	//    documentation and/or other materials provided with the distribution.
	//  * Neither the name of NVIDIA CORPORATION nor the names of its
	//    contributors may be used to endorse or promote products derived
	//    from this software without specific prior written permission.
	//
	// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ''AS IS'' AND ANY
	// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
	// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
	// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
	// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
	// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
	// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	//
	//----------------------------------------------------------------------------------

	#ifndef FXAA_DISCARD
			//
			// Only valid for PC OpenGL currently.
			// Probably will not work when FXAA_GREEN_AS_LUMA = 1.
			//
			// 1 = Use discard on pixels which don't need AA.
			//     For APIs which enable concurrent TEX+ROP from same surface.
			// 0 = Return unchanged color on pixels which don't need AA.
			//
			#define FXAA_DISCARD 0
	#endif

	/*--------------------------------------------------------------------------*/
	#define FxaaTexTop(t, p) texture2D(t, p, -100.0)
	#define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), -100.0)
	/*--------------------------------------------------------------------------*/

	#define NUM_SAMPLES 5

	// assumes colors have premultipliedAlpha, so that the calculated color contrast is scaled by alpha
	float contrast( vec4 a, vec4 b ) {
			vec4 diff = abs( a - b );
			return max( max( max( diff.r, diff.g ), diff.b ), diff.a );
	}

	/*============================================================================

									FXAA3 QUALITY - PC

	============================================================================*/

	/*--------------------------------------------------------------------------*/
	vec4 FxaaPixelShader(
			vec2 posM,
			sampler2D tex,
			vec2 fxaaQualityRcpFrame,
			float fxaaQualityEdgeThreshold,
			float fxaaQualityinvEdgeThreshold
	) {
			vec4 rgbaM = FxaaTexTop(tex, posM);
			vec4 rgbaS = FxaaTexOff(tex, posM, vec2( 0.0, 1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaE = FxaaTexOff(tex, posM, vec2( 1.0, 0.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaN = FxaaTexOff(tex, posM, vec2( 0.0,-1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaW = FxaaTexOff(tex, posM, vec2(-1.0, 0.0), fxaaQualityRcpFrame.xy);
			// . S .
			// W M E
			// . N .

			bool earlyExit = max( max( max(
					contrast( rgbaM, rgbaN ),
					contrast( rgbaM, rgbaS ) ),
					contrast( rgbaM, rgbaE ) ),
					contrast( rgbaM, rgbaW ) )
					< fxaaQualityEdgeThreshold;
			// . 0 .
			// 0 0 0
			// . 0 .

			#if (FXAA_DISCARD == 1)
					if(earlyExit) FxaaDiscard;
			#else
					if(earlyExit) return rgbaM;
			#endif

			float contrastN = contrast( rgbaM, rgbaN );
			float contrastS = contrast( rgbaM, rgbaS );
			float contrastE = contrast( rgbaM, rgbaE );
			float contrastW = contrast( rgbaM, rgbaW );

			float relativeVContrast = ( contrastN + contrastS ) - ( contrastE + contrastW );
			relativeVContrast *= fxaaQualityinvEdgeThreshold;

			bool horzSpan = relativeVContrast > 0.;
			// . 1 .
			// 0 0 0
			// . 1 .

			// 45 deg edge detection and corners of objects, aka V/H contrast is too similar
			if( abs( relativeVContrast ) < .3 ) {
					// locate the edge
					vec2 dirToEdge;
					dirToEdge.x = contrastE > contrastW ? 1. : -1.;
					dirToEdge.y = contrastS > contrastN ? 1. : -1.;
					// . 2 .      . 1 .
					// 1 0 2  ~=  0 0 1
					// . 1 .      . 0 .

					// tap 2 pixels and see which ones are "outside" the edge, to
					// determine if the edge is vertical or horizontal

					vec4 rgbaAlongH = FxaaTexOff(tex, posM, vec2( dirToEdge.x, -dirToEdge.y ), fxaaQualityRcpFrame.xy);
					float matchAlongH = contrast( rgbaM, rgbaAlongH );
					// . 1 .
					// 0 0 1
					// . 0 H

					vec4 rgbaAlongV = FxaaTexOff(tex, posM, vec2( -dirToEdge.x, dirToEdge.y ), fxaaQualityRcpFrame.xy);
					float matchAlongV = contrast( rgbaM, rgbaAlongV );
					// V 1 .
					// 0 0 1
					// . 0 .

					relativeVContrast = matchAlongV - matchAlongH;
					relativeVContrast *= fxaaQualityinvEdgeThreshold;

					if( abs( relativeVContrast ) < .3 ) { // 45 deg edge
							// 1 1 .
							// 0 0 1
							// . 0 1

							// do a simple blur
							return mix(
									rgbaM,
									(rgbaN + rgbaS + rgbaE + rgbaW) * .25,
									.4
							);
					}

					horzSpan = relativeVContrast > 0.;
			}

			if(!horzSpan) rgbaN = rgbaW;
			if(!horzSpan) rgbaS = rgbaE;
			// . 0 .      1
			// 1 0 1  ->  0
			// . 0 .      1

			bool pairN = contrast( rgbaM, rgbaN ) > contrast( rgbaM, rgbaS );
			if(!pairN) rgbaN = rgbaS;

			vec2 offNP;
			offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;
			offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;

			bool doneN = false;
			bool doneP = false;

			float nDist = 0.;
			float pDist = 0.;

			vec2 posN = posM;
			vec2 posP = posM;

			int iterationsUsed = 0;
			int iterationsUsedN = 0;
			int iterationsUsedP = 0;
			for( int i = 0; i < NUM_SAMPLES; i++ ) {
					iterationsUsed = i;

					float increment = float(i + 1);

					if(!doneN) {
							nDist += increment;
							posN = posM + offNP * nDist;
							vec4 rgbaEndN = FxaaTexTop(tex, posN.xy);
							doneN = contrast( rgbaEndN, rgbaM ) > contrast( rgbaEndN, rgbaN );
							iterationsUsedN = i;
					}

					if(!doneP) {
							pDist += increment;
							posP = posM - offNP * pDist;
							vec4 rgbaEndP = FxaaTexTop(tex, posP.xy);
							doneP = contrast( rgbaEndP, rgbaM ) > contrast( rgbaEndP, rgbaN );
							iterationsUsedP = i;
					}

					if(doneN || doneP) break;
			}


			if ( !doneP && !doneN ) return rgbaM; // failed to find end of edge

			float dist = min(
					doneN ? float( iterationsUsedN ) / float( NUM_SAMPLES - 1 ) : 1.,
					doneP ? float( iterationsUsedP ) / float( NUM_SAMPLES - 1 ) : 1.
			);

			// hacky way of reduces blurriness of mostly diagonal edges
			// but reduces AA quality
			dist = pow(dist, .5);

			dist = 1. - dist;

			return mix(
					rgbaM,
					rgbaN,
					dist * .5
			);
	}

	void main() {
			const float edgeDetectionQuality = .2;
			const float invEdgeDetectionQuality = 1. / edgeDetectionQuality;

			gl_FragColor = FxaaPixelShader(
					vUv,
					tDiffuse,
					resolution,
					edgeDetectionQuality, // [0,1] contrast needed, otherwise early discard
					invEdgeDetectionQuality
			);

	}
	`
}

window.Zh = `
precision highp float;
precision highp int;
#define GLSLIFY 1

uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec4 color;`

window.$h = `
precision highp float;
precision highp int;
#define GLSLIFY 1
`

window.Qh = `
#define GLSLIFY 1
vec3 objectNormal = vec3( normal );
vec3 transformedNormal = objectNormal;

#ifdef USE_INSTANCING
    mat3 m = mat3( instanceMatrix );
    transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
    transformedNormal = m * transformedNormal;
#endif

transformedNormal = normalMatrix * transformedNormal;

vNormal = normalize( transformedNormal );`

window.Jh = `
#define GLSLIFY 1
attribute float aProgress;
attribute float aSpeed;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vPosition;
varying vec2 vScreenSpace;
varying vec3 vViewPosition;

uniform float uTime;
uniform float uSpeed;
uniform float uHeightRange;

void main()	{
    vUv = uv;

    vec3 transformed = vec3( position );

    vec3 up = vec3(modelViewMatrix[0][1], modelViewMatrix[1][1], modelViewMatrix[2][1]);
    vec3 right = vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]);
    vec3 billboardPos = right * position.x + up * position.y;

    vec4 mvPosition = vec4( billboardPos, 1.0 );

    float yPos = mod(aProgress - uTime * aSpeed * 0.25, 1.) * uHeightRange - (uHeightRange * 0.5);
    // float yPos = mod(aProgress, 1.) * 20. - 10.;

    vec4 worldPosition = vec4( transformed, 1.0 );
    #ifdef USE_INSTANCING
        worldPosition = instanceMatrix * worldPosition;
    #endif
    worldPosition.y += yPos;
    worldPosition = modelMatrix * worldPosition;
    vWorldPosition = worldPosition.xyz;

    vPosition = transformed;

    #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
    #endif

    mvPosition.y += yPos;

    vec4 earlyProjection = projectionMatrix * modelViewMatrix * mvPosition;
    vScreenSpace = earlyProjection.xy / earlyProjection.w * 0.5 + vec2(0.5);

    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;

    vViewPosition = -mvPosition.xyz;
}`

window.ef = `
#define GLSLIFY 1
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vScreenSpace;
varying vec3 vViewPosition;

uniform sampler2D uBgTexture;
uniform sampler2D uNormalTexture;
uniform float uBaseBrightness;
uniform float uRefraction;

void main() {
    vec4 normalColor = texture2D(uNormalTexture, vUv);

    if (normalColor.a < 0.5) discard;

    vec3 normal = normalize(normalColor.rgb * 2. - 1.);

    vec2 uv = vUv;
    uv = normal.xy;
    uv = vec2(vScreenSpace.x, vScreenSpace.y) + uv * uRefraction;

    vec4 bgColor = texture2D(uBgTexture, uv);

    // vec3 rainColor = vec3(0.89, 0.92, 1.);
    // gl_FragColor = vec4(rainColor, 1.);
    gl_FragColor = vec4(bgColor.rgb + uBaseBrightness * pow(normal.b, 10.), 1.);
    // gl_FragColor = vec4(normal.rgb, 1.);
}`

window.nf = `
#define GLSLIFY 1
attribute vec2 uv2;

varying vec4 vMirrorCoord;
varying vec2 vUv;
varying vec2 vUv2;
varying vec3 vWorldPosition;

uniform mat4 uTextureMatrix;

void main () {
	vec3 transformedPosition = position;

	vUv = uv;
	vUv2 = uv2;

	vWorldPosition = (modelMatrix * vec4(position, 1.)).xyz;

	vMirrorCoord = uTextureMatrix * vec4( transformedPosition, 1.0 );

	vec4 mvPosition = vec4( transformedPosition, 1.0 );
	mvPosition = modelViewMatrix * mvPosition;

	gl_Position = projectionMatrix * mvPosition;
}`

window.rf = `
#define GLSLIFY 1
float blendSoftLight(float base, float blend) {
	return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
	return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}

vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
	return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLinearDodge(float base, float blend) {
	// Note : Same implementation as BlendAddf
	return min(base+blend,1.0);
}

vec3 blendLinearDodge(vec3 base, vec3 blend) {
	// Note : Same implementation as BlendAdd
	return min(base+blend,vec3(1.0));
}

vec3 blendLinearDodge(vec3 base, vec3 blend, float opacity) {
	return (blendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLinearBurn(float base, float blend) {
	// Note : Same implementation as BlendSubtractf
	return max(base+blend-1.0,0.0);
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
	// Note : Same implementation as BlendSubtract
	return max(base+blend-vec3(1.0),vec3(0.0));
}

vec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {
	return (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLinearLight(float base, float blend) {
	return blend<0.5?blendLinearBurn(base,(2.0*blend)):blendLinearDodge(base,(2.0*(blend-0.5)));
}

vec3 blendLinearLight(vec3 base, vec3 blend) {
	return vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));
}

vec3 blendLinearLight(vec3 base, vec3 blend, float opacity) {
	return (blendLinearLight(base, blend) * opacity + base * (1.0 - opacity));
}

varying vec4 vMirrorCoord;
varying vec2 vUv;
varying vec2 vUv2;
varying vec3 vWorldPosition;

uniform sampler2D uRoughnessTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uOpacityTexture;
uniform vec2 uTexScale;
uniform sampler2D uTexture;
uniform vec2 uMipmapTextureSize;
uniform float uDistortionAmount;
uniform float uBlurStrength;
uniform float uTime;
uniform float uRainCount;

vec4 cubic(float v) {
    vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
    vec4 s = n * n * n;
    float x = s.x;
    float y = s.y - 4.0 * s.x;
    float z = s.z - 4.0 * s.y + 6.0 * s.x;
    float w = 6.0 - x - y - z;
    return vec4(x, y, z, w);
}

// https://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl
vec4 textureBicubic(sampler2D t, vec2 texCoords, vec2 textureSize) {
    vec2 invTexSize = 1.0 / textureSize;
    texCoords = texCoords * textureSize - 0.5;

    vec2 fxy = fract(texCoords);
    texCoords -= fxy;
    vec4 xcubic = cubic(fxy.x);
    vec4 ycubic = cubic(fxy.y);

    vec4 c = texCoords.xxyy + vec2(-0.5, 1.5).xyxy;

    vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
    vec4 offset = c + vec4(xcubic.yw, ycubic.yw) / s;

    offset *= invTexSize.xxyy;

    vec4 sample0 = texture2D(t, offset.xz);
    vec4 sample1 = texture2D(t, offset.yz);
    vec4 sample2 = texture2D(t, offset.xw);
    vec4 sample3 = texture2D(t, offset.yw);

    float sx = s.x / (s.x + s.y);
    float sy = s.z / (s.z + s.w);

    return mix(mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);
}

// With original size argument
vec4 packedTexture2DLOD(sampler2D tex, vec2 uv, int level, vec2 originalPixelSize) {
    float floatLevel = float(level);
    vec2 atlasSize;
    atlasSize.x = floor(originalPixelSize.x * 1.5);
    atlasSize.y = originalPixelSize.y;

    // we stop making mip maps when one dimension == 1

    float maxLevel = min(floor(log2(originalPixelSize.x)), floor(log2(originalPixelSize.y)));
    floatLevel = min(floatLevel, maxLevel);

    // use inverse pow of 2 to simulate right bit shift operator

    vec2 currentPixelDimensions = floor(originalPixelSize / pow(2.0, floatLevel));
    vec2 pixelOffset = vec2(floatLevel > 0.0 ? originalPixelSize.x : 0.0, floatLevel > 0.0 ? currentPixelDimensions.y : 0.0);

    // "minPixel / atlasSize" samples the top left piece of the first pixel
    // "maxPixel / atlasSize" samples the bottom right piece of the last pixel
    vec2 minPixel = pixelOffset;
    vec2 maxPixel = pixelOffset + currentPixelDimensions;
    vec2 samplePoint = mix(minPixel, maxPixel, uv);
    samplePoint /= atlasSize;
    vec2 halfPixelSize = 1.0 / (2.0 * atlasSize);
    samplePoint = min(samplePoint, maxPixel / atlasSize - halfPixelSize);
    samplePoint = max(samplePoint, minPixel / atlasSize + halfPixelSize);
    return textureBicubic(tex, samplePoint, originalPixelSize);
}

vec4 packedTexture2DLOD(sampler2D tex, vec2 uv, float level, vec2 originalPixelSize) {
    float ratio = mod(level, 1.0);
    int minLevel = int(floor(level));
    int maxLevel = int(ceil(level));
    vec4 minValue = packedTexture2DLOD(tex, uv, minLevel, originalPixelSize);
    vec4 maxValue = packedTexture2DLOD(tex, uv, maxLevel, originalPixelSize);
    return mix(minValue, maxValue, ratio);
}

// Rain drop shader from https://www.shadertoy.com/view/ldfyzl Ctrl-Alt-Test (http://www.ctrl-alt-test.fr)
// Maximum number of cells a ripple can cross.
#define MAX_RADIUS 1

// Hash functions shamefully stolen from:
// https://www.shadertoy.com/view/4djSRW
#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.xx + p3.yz) * p3.zy);

}

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
    vec2 texUv = vUv * uTexScale;
    float floorOpacity = texture2D(uOpacityTexture, texUv).r;
    vec3 floorNormal = texture2D(uNormalTexture, texUv).rgb * 2. - 1.;
    floorNormal = normalize(floorNormal);
    float roughness = texture2D(uRoughnessTexture, texUv).r;

    vec2 reflectionUv = vMirrorCoord.xy / vMirrorCoord.w;

    vec2 rippleUv = 75. * vUv * uTexScale;

    vec2 p0 = floor(rippleUv);

    float rainStrength = map(uRainCount, 0., 10000., 3., 0.5);
    if(rainStrength == 3.) {
        rainStrength = 50.;
    }

    vec2 circles = vec2(0.);
    for(int j = -MAX_RADIUS; j <= MAX_RADIUS; ++j) {
        for(int i = -MAX_RADIUS; i <= MAX_RADIUS; ++i) {
            vec2 pi = p0 + vec2(i, j);
            vec2 hsh = pi;
            vec2 p = pi + hash22(hsh);

            float t = fract(0.8 * uTime + hash12(hsh));
            vec2 v = p - rippleUv;
            float d = length(v) - (float(MAX_RADIUS) + 1.) * t + (rainStrength * 0.1 * t);

            float h = 1e-3;
            float d1 = d - h;
            float d2 = d + h;
            float p1 = sin(31. * d1) * smoothstep(-0.6, -0.3, d1) * smoothstep(0., -0.3, d1);
            float p2 = sin(31. * d2) * smoothstep(-0.6, -0.3, d2) * smoothstep(0., -0.3, d2);
            circles += 0.5 * normalize(v) * ((p2 - p1) / (2. * h) * pow(1. - t, rainStrength));
        }
    }
    circles /= float((MAX_RADIUS * 2 + 1) * (MAX_RADIUS * 2 + 1));

    float intensity = 0.05 * floorOpacity;
    vec3 n = vec3(circles, sqrt(1. - dot(circles, circles)));

    vec3 color = packedTexture2DLOD(uTexture, reflectionUv + floorNormal.xy * uDistortionAmount - intensity * n.xy, roughness * uBlurStrength, uMipmapTextureSize).rgb;

    gl_FragColor = vec4(color, 1.0);
}`

window.of = `
precision highp float;
precision highp int;
#define GLSLIFY 1

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0 );
}`

window.lf = `
precision highp float;
precision highp int;
#define GLSLIFY 1

uniform sampler2D uTexture;

varying vec2 vUv;

void main () {
    gl_FragColor = texture2D(uTexture, vUv);
}
`

window.cf = `
#define GLSLIFY 1
varying vec2 vUv;

void main() {
    #include <begin_vertex>
    #include <project_vertex>
    vUv = uv;
}`

window.uf = `
#define GLSLIFY 1
varying vec2 vUv;

uniform sampler2D map;
uniform int parentLevel;
uniform vec2 parentMapSize;
uniform vec2 originalMapSize;

// With original size argument
vec4 packedTexture2DLOD( sampler2D tex, vec2 uv, int level, vec2 originalPixelSize ) {

    float floatLevel = float( level );
    vec2 atlasSize;
    atlasSize.x = floor( originalPixelSize.x * 1.5 );
    atlasSize.y = originalPixelSize.y;

    // we stop making mip maps when one dimension == 1
    float maxLevel = min( floor( log2( originalPixelSize.x ) ), floor( log2( originalPixelSize.y ) ) );
    floatLevel = min( floatLevel, maxLevel );

    // use inverse pow of 2 to simulate right bit shift operator
    vec2 currentPixelDimensions = floor( originalPixelSize / pow( 2.0, floatLevel ) );
    vec2 pixelOffset = vec2(
        floatLevel > 0.0 ? originalPixelSize.x : 0.0,
        floatLevel > 0.0 ? currentPixelDimensions.y : 0.0
    );

    // "minPixel / atlasSize" samples the top left piece of the first pixel
    // "maxPixel / atlasSize" samples the bottom right piece of the last pixel
    vec2 minPixel = pixelOffset;
    vec2 maxPixel = pixelOffset + currentPixelDimensions;
    vec2 samplePoint = mix( minPixel, maxPixel, uv );
    samplePoint /= atlasSize;

    vec2 halfPixelSize = 1.0 / ( 2.0 * atlasSize );
    samplePoint = min( samplePoint, maxPixel / atlasSize - halfPixelSize );
    samplePoint = max( samplePoint, minPixel / atlasSize + halfPixelSize );

    return texture2D( tex, samplePoint );

}

#define SAMPLES 6

vec4 sampleAt( vec2 uv ) {
    return packedTexture2DLOD( map, uv, parentLevel, originalMapSize );
}

void main() {

    vec2 childMapSize = parentMapSize / 2.0;
    vec2 childPixelPos = floor( vUv * childMapSize );

    vec2 parentPixelSize = 1.0 / parentMapSize;
    vec2 halfParentPixelSize = parentPixelSize / 2.0;
    vec2 parentPixelPos = childPixelPos * 2.0;

    vec2 baseUv = ( parentPixelPos / parentMapSize ) + halfParentPixelSize;

    vec4 samples[ SAMPLES ];
    float weights[ SAMPLES ];

    float xden = 2.0 * parentMapSize.x + 1.0;
    float wx0 = ( parentMapSize.x - parentPixelPos.x ) / xden;
    float wx1 = ( parentMapSize.x ) / xden;
    float wx2 = ( parentPixelPos.x + 1.0 ) / xden;

    float yden = 2.0 * parentMapSize.y + 1.0;
    float wy0 = ( parentMapSize.y - parentPixelPos.y ) / yden;
    float wy1 = ( parentMapSize.y ) / yden;
    float wy2 = ( parentPixelPos.y + 1.0 ) / yden;

    samples[ 0 ] = sampleAt( baseUv );
    samples[ 1 ] = sampleAt( baseUv + vec2( parentPixelSize.x, 0.0 ) );
    samples[ 2 ] = sampleAt( baseUv + vec2( 2.0 * parentPixelSize.x, 0.0 ) );

    samples[ 3 ] = sampleAt( baseUv + vec2( 0.0, parentPixelSize.y ) );
    samples[ 4 ] = sampleAt( baseUv + vec2( parentPixelSize.x, parentPixelSize.y ) );
    samples[ 5 ] = sampleAt( baseUv + vec2( 2.0 * parentPixelSize.x, parentPixelSize.y ) );

    // samples[ 6 ] = sampleAt( baseUv + vec2( 0.0, 2.0 * parentPixelSize.y ) );
    // samples[ 7 ] = sampleAt( baseUv + vec2( parentPixelSize.x, 2.0 * parentPixelSize.y ) );
    // samples[ 8 ] = sampleAt( baseUv + vec2( 2.0 * parentPixelSize.x, 2.0 * parentPixelSize.y ) );

    weights[ 0 ] = wx0 * wy0;
    weights[ 1 ] = wx1 * wy0;
    weights[ 2 ] = wx2 * wy0;

    weights[ 3 ] = wx0 * wy1;
    weights[ 4 ] = wx1 * wy1;
    weights[ 5 ] = wx2 * wy1;

    // weights[ 6 ] = wx0 * wy2;
    // weights[ 7 ] = wx1 * wy2;
    // weights[ 8 ] = wx2 * wy2;

    #pragma unroll_loop
    for ( int i = 0; i < SAMPLES; i ++ ) {
        gl_FragColor += samples[ i ] * weights[ i ];
    }
}`