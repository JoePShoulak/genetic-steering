function windowResized() {
  resizeCanvas(innerWidth, innerHeight);
}

let vehicles = [];
let pellets = [];

const pelletCount = 200;
const vehicleCount = 10;

const toggleVisuals = () => (Vehicle.verboseVisuals = !Vehicle.verboseVisuals);

function newGeneration(oldVehicles) {
  if (oldVehicles) {
    const newVehicles = [];
    while (newVehicles.length < vehicleCount) {
      const [a, b] = Vehicle.randomPair;
      newVehicles.push(a.breed(b));
    }
    vehicles = newVehicles;
  } else {
    vehicles = Array(vehicleCount)
      .fill()
      .map(() => new Vehicle());
  }
  pellets = Array(pelletCount)
    .fill()
    .map(() => new Pellet());
}

function setup() {
  createCanvas(innerWidth, innerHeight);

  createButton("Toggle Visuals").mouseClicked(toggleVisuals).position(0, 0);

  newGeneration();
}

function draw() {
  background(20);
  pellets.forEach((p) => p.update());
  vehicles.forEach((v) => v.update(pellets));

  pellets = pellets.filter((p) => !p.consumed);

  if (pellets.length < pelletCount) pellets.push(new Pellet());

  if (vehicles.every((v) => !v.alive)) newGeneration();
}
