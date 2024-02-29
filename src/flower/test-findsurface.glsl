#if defined(VERTEX)
varying vec2 v_uv;
varying vec4 vColor;

void main(){
    v_uv=uv;
    vColor=vec4(color, 1.0);;
    
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}
#else
varying vec2 v_uv;
varying vec4 vColor;
uniform float maxSurfaceId;

void main(){
    // Normalize the surfaceId when writing to texture
    // Surface ID needs rounding as precision can be lost in perspective correct interpolation
    // - see https://github.com/OmarShehata/webgl-outlines/issues/9 for other solutions eg. flat interpolation.
    float surfaceId=round(vColor.r)/maxSurfaceId;
    gl_FragColor=vec4(surfaceId,0.,0.,1.);
}
#endif