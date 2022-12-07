const display = {
  pellet: (pellet) => {
    noStroke();
    fill(pellet.color);
    circle(pellet.pos.x, pellet.pos.y, pellet.size);
  },

  lineToClosest: (vehicle, kind) => {
    const pellet = vehicle.closest(pellets, kind);
    stroke(pellet.color);

    const target = pellet.pos
      .copy()
      .sub(vehicle.pos)
      .normalize()
      .mult(vehicle.dna[`${kind}`].force * 300);

    line(0, 0, target.x, target.y);
    noStroke();
  },

  viewRadius: (vehicle, kind) => {
    stroke(Pellet.details[kind].color);
    noFill();
    circle(0, 0, 2 * vehicle.dna[`${kind}`].radius);
  },

  vehicle: (vehicle) => {
    push();
    noStroke();
    fill(vehicle.color);
    translate(vehicle.pos);

    rotate(vehicle.vel.heading() + HALF_PI);

    beginShape();
    vertex(0, -vehicle.size);
    vertex(vehicle.size / 2, vehicle.size);
    vertex(0, vehicle.size / 2);
    vertex(-vehicle.size / 2, vehicle.size);
    endShape();

    if (!Vehicle.verboseVisuals) return pop();

    Pellet.kinds.forEach((kind, i) => {
      strokeWeight(2 - i);
      display.lineToClosest(vehicle, kind);
      display.viewRadius(vehicle, kind);
    });

    pop();
  },
};

const randomPos = () => createVector(random(width), random(height));

function randomByProp(arr, prop) {
  let i = 0;
  let f = Math.random() * arr.reduce((a, v) => a + v[prop], 0);

  while (f > 0) {
    f -= arr[i][prop];
    if (f < 0) break;
    i++;
  }

  return arr[i];
}
