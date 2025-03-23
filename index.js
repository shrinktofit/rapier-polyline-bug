// @ts-check

import RAPIER from "./node_modules/@dimforge/rapier2d-compat/rapier.es.js";

async function main() {
  await RAPIER.init();

  const gravity = { x: 0, y: -9.81 };
  const world = new RAPIER.World(gravity);
  
  // Ground(collider-only, fixed)
  {
    const boxScale = 2;
    const usePolyline = true;
    let groundColliderDesc;
    if (usePolyline) {
      const vertices = [
        1, 1,
        -1, 1,
        -1, -1,
        1, -1
      ].map(v => v  * boxScale);
      const indices = [
        0, 1,
        1, 2,
        2, 3,
        3, 0,
      ];
      groundColliderDesc = RAPIER.ColliderDesc.polyline(vertices, indices);
    } else {
      groundColliderDesc = RAPIER.ColliderDesc.cuboid(boxScale, boxScale);
    }
    world.createCollider(groundColliderDesc);
  }

  // Ball(dynamic)
  {
    const desc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(8.5, 1)
      .setLinvel(-20, 0);
      ;
    const rigidBody = world.createRigidBody(desc);
    const colliderDesc = RAPIER.ColliderDesc.ball(0.1);
    world.createCollider(colliderDesc, rigidBody);
  }

  tick();

  function tick() {
    requestAnimationFrame(tick);
    gameLoop();
  }

  function gameLoop() {
    world.step();
    render();
  }

  function render() {
    /** @type {HTMLCanvasElement | null} */
    const canvas = document.getElementById("canvas");
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    canvas.width = parseInt(canvas.style.width) * window.devicePixelRatio;
    canvas.height = parseInt(canvas.style.height) * window.devicePixelRatio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    const scale = 20;
    ctx.scale(scale, scale);
    ctx.lineWidth = 1 / scale;
    const { vertices, colors } = world.debugRender();
    for (let i = 0; i < vertices.length / 4; ++i) {
      const r = colors[i * 8 + 0];
      const g = colors[i * 8 + 1];
      const b = colors[i * 8 + 2];
      ctx.strokeStyle = colorToHex(r, g, b);
      ctx.beginPath();
      ctx.moveTo(vertices[i * 4 + 0], -vertices[i * 4 + 1]);
      ctx.lineTo(vertices[i * 4 + 2], -vertices[i * 4 + 3]);
      ctx.stroke();
    }
  }
}

function colorToHex(r, g, b) {
  const toHex = (x) => Math.floor(x * 256).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

main();
