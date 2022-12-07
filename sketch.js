function windowResized() {
  resizeCanvas(innerWidth, innerHeight);
  reset();
}

let vehicles = [];
let pellets = [];
let generationCount = 1;

let pelletCount;
const vehicleCount = 10;

const toggleVisuals = () => (Vehicle.verboseVisuals = !Vehicle.verboseVisuals);

function newGeneration(oldVehicles) {
  if (oldVehicles) {
    console.log("  Oldest:", max(oldVehicles.map((v) => v.age)));
    vehicles = [...oldVehicles].map(() => {
      const [a, b] = Vehicle.randomPair(vehicles);
      return a.breed(b);
    });
  } else {
    vehicles = Array(vehicleCount)
      .fill()
      .map(() => new Vehicle());
  }
  pellets = Array(pelletCount)
    .fill()
    .map(() => new Pellet());
  console.log("Generation:", generationCount);

  generationCount++;
}

function reset() {
  pelletCount = ~~((width * height) / 1500);
}

function setup() {
  createCanvas(innerWidth, innerHeight);

  createButton("Toggle Visuals").mouseClicked(toggleVisuals).position(0, 0);

  reset();
  newGeneration();
}

function draw() {
  background(20);
  pellets.forEach((p) => p.update());
  vehicles.forEach((v) => v.update(pellets));

  pellets = pellets.filter((p) => !p.consumed);

  if (pellets.length < pelletCount) pellets.push(new Pellet());

  if (vehicles.every((v) => !v.alive)) newGeneration(vehicles);
}
