var camera = v(),
  cameraBounds = {
    min: v(0, 0),
    max: v(4076, 2200),
  };

Matter.Events.on(render, "beforeRender", function () {
  let center = v(-render.canvas.width / 4, -render.canvas.height / 4),
    scale = 3;

  var dims = v(render.canvas.width, render.canvas.height);

  var clampedCameraBounds = { ...cameraBounds };
  if (
    Math.abs(clampedCameraBounds.min.x - clampedCameraBounds.max.x) < dims.x
  ) {
    var diff = Math.abs(
      Math.abs(clampedCameraBounds.min.x - clampedCameraBounds.max.x) - dims.x
    );
    clampedCameraBounds.min.x -= diff / 2;
    clampedCameraBounds.min.x += diff / 2;
  }

  //clampedCameraBounds.min.x += dims.x/2
  //clampedCameraBounds.max.x -= dims.x/2

  targetPos = v(
    clamp(
      player.body.position.x,
      clampedCameraBounds.min.x + (render.canvas.width / 4)*scale,
      clampedCameraBounds.max.x - (render.canvas.width / 4)*scale
    ),
    clamp(
      player.body.position.y,
      clampedCameraBounds.min.y + (render.canvas.height / 4)*scale,
      clampedCameraBounds.max.y - (render.canvas.height / 4)*scale
    )
  );

  let xDiff = targetPos.x - camera.x,
    yDiff = targetPos.y - camera.y;

  camera.x += xDiff * 0.05;
  camera.y += yDiff * 0.05;
  //camera = {...targetPos}
  camera = v(
    clamp(
      camera.x,
      clampedCameraBounds.min.x + (render.canvas.width / 4)*scale,
      clampedCameraBounds.max.x - (render.canvas.width / 4)*scale
    ),
    clamp(
      camera.y,
      clampedCameraBounds.min.y + (render.canvas.height / 4)*scale,
      clampedCameraBounds.max.y - (render.canvas.height / 4)*scale
    )
  );

  // Follow Hero at X-axis
  render.bounds.min.x = center.x * scale + camera.x;
  render.bounds.max.x =
    center.x * scale + camera.x + (initalRenderBounds.max.x * scale) / 2;

  // Follow Hero at Y-axis
  render.bounds.min.y = center.y * scale + camera.y;
  render.bounds.max.y =
    center.y * scale + camera.y + (initalRenderBounds.max.y * scale) / 2;
  Matter.Render.startViewTransform(render);
});

Matter.Events.on(render, "afterRender", function () {
  var ctx = render.context,
    width = 100;
  var img = document.getElementById("gun");
  var height = (img.height / img.width) * width,
    direction = Math.sign(player.body.velocity.x);
  ctx.save();
  ctx.translate(player.body.position.x, player.body.position.x + height / 2);
  ctx.scale(1 * direction, 1);
  ctx.translate(
    -player.body.position.x,
    -(player.body.position.x + height / 2)
  );
  ctx.drawImage(
    img,
    player.body.position.x,
    player.body.position.y,
    width,
    height
  );
  ctx.restore();

  //render.context.fillRect(player.body.position.x, player.body.position.y, 100,100)
});