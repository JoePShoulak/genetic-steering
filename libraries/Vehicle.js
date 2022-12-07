class Pellet {
  static poisonRate = 0.2;
  static kinds = ["poison", "food"];
  static size = 5;

  static details = {
    poison: {
      color: "red",
      value: -100,
    },
    food: {
      color: "yellow",
      value: 25,
    },
  };

  constructor(kind) {
    this.pos = randomPos();
    this.consumed = false;
    this.size = Pellet.size;
    this.kind = kind ?? random() < Pellet.poisonRate ? "poison" : "food";

    this.color = Pellet.details[this.kind].color;
    this.value = Pellet.details[this.kind].value;
  }

  update() {
    if (this.consumed) return;

    display.pellet(this);
  }
}

class Vehicle {
  static verboseVisuals = true;

  static random(vehicles) {
    return randomByProp(vehicles, "age");
  }

  static randomPair(vehicles) {
    return Array(2)
      .fill()
      .map(() => Vehicle.random(vehicles));
  }

  constructor(dna) {
    this.pos = randomPos();
    this.vel = p5.Vector.random2D();
    this.acc = createVector();

    this.age = 0;
    this.health = 500;
    this.size = 10;
    this.maxSpeed = 2;
    this.maxForce = 0.2;
    this.maxRadius = 100;
    this.mutationRate = 0.01;
    this.alive = true;
    this.cloneRate = 0.0003;

    this.dna = dna ?? {
      food: {
        force: this.randomDNA.force(),
        radius: this.randomDNA.radius(),
      },
      poison: {
        force: this.randomDNA.force(),
        radius: this.randomDNA.radius(),
      },
    };
  }

  get randomDNA() {
    return {
      force: () => random(-this.maxForce, this.maxForce),
      radius: () => random(this.hitRadius, this.maxRadius),
    };
  }

  get hitRadius() {
    return this.size + Pellet.size;
  }

  get color() {
    return lerpColor(color("red"), color("yellow"), this.health / 500);
  }

  get onScreen() {
    return (
      this.pos.x > 0 &&
      this.pos.x < width &&
      this.pos.y > 0 &&
      this.pos.y < height
    );
  }

  /* == LIFECYCLE == */
  die() {
    this.alive = false;
  }

  mutate() {
    if (random() < this.mutationRate)
      this.dna.food.force = this.randomDNA.force();
    if (random() < this.mutationRate)
      this.dna.poison.force = this.randomDNA.force();
    if (random() < this.mutationRate)
      this.dna.food.radius = this.randomDNA.radius();
    if (random() < this.mutationRate)
      this.dna.poison.radius = this.randomDNA.radius();

    return this;
  }

  clone() {
    return new Vehicle(this.dna).mutate();
  }

  breed(other) {
    const dna = {
      food: {
        force: lerp(this.dna.food.force, other.dna.food.force, random()),
        radius: lerp(this.dna.food.radius, other.dna.food.radius, random()),
      },
      poison: {
        force: lerp(this.dna.poison.force, other.dna.poison.force, random()),
        radius: lerp(this.dna.poison.radius, other.dna.poison.radius, random()),
      },
    };
    // const dna = {
    //   food: {
    //     force: random() > 0.5 ? this.dna.food.force : other.dna.food.force,
    //     radius: random() > 0.5 ? this.dna.food.radius : other.dna.food.radius,
    //   },
    //   poison: {
    //     force: random() > 0.5 ? this.dna.poison.force : other.dna.poison.force,
    //     radius:
    //       random() > 0.5 ? this.dna.poison.radius : other.dna.poison.radius,
    //   },
    // };

    return new Vehicle(dna).mutate();
  }

  /* == PELLETS == */

  dist(pos) {
    return this.pos.copy().sub(pos).mag();
  }

  distSq(pos) {
    return this.pos.copy().sub(pos).magSq();
  }

  canConsume(pellet) {
    return this.dist(pellet.pos) < this.hitRadius && !pellet.consumed;
  }

  consume(pellet) {
    if (!this.canConsume(pellet)) return;

    this.health += pellet.value;

    pellet.consumed = true;
  }

  closest(pellets, kind) {
    if (kind) pellets = pellets.filter((p) => p.kind === kind);

    return pellets
      .filter((pellet) => !pellet.consumed)
      .reduce((a, v) => (this.distSq(v.pos) < this.distSq(a.pos) ? v : a));
  }

  canSee(pellet) {
    return this.dist(pellet.pos) < this.dna[pellet.kind].radius;
  }

  /* == PHYSICS == */
  seek(obj) {
    if (obj instanceof Pellet && !this.canSee(obj)) return;

    const projected = this.pos.copy().add(this.vel);
    const desired = obj.pos.copy().sub(projected);

    this.applyForce(desired.mult(this.dna[obj.kind]?.force ?? 1));
  }

  applyForce(vec) {
    this.acc.add(vec).limit(this.maxForce);
  }

  update(pellets) {
    if (!this.alive) return;

    this.age++;
    this.health--;
    if (this.health < 0) return this.die();

    if (this.onScreen) {
      Pellet.kinds.forEach((kind) => this.seek(this.closest(pellets, kind)));
    } else {
      this.seek({ pos: createVector(width / 2, height / 2) });
    }

    this.vel.add(this.acc).limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    pellets.forEach((pellet) => this.consume(pellet));

    display.vehicle(this);
  }
}
