#version 300 es

precision mediump float;

#if defined(VERTEX)
in vec3 position;

out vec4 vertexColor;

void main() {
    if (position.x < -0.5) {
        vertexColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else if (position.x >= -0.5 && position.x <= 0.5) {
        vertexColor = vec4(0.0, 1.0, 0.0, 1.0);
    } else {
        vertexColor = vec4(0.0, 0.0, 1.0, 1.0);
    }

    gl_Position = vec4(position, 1.0);
}

#else

in vec4 vertexColor;

out vec4 FragColor;

void main() {
    FragColor = vertexColor;
}

#endif
