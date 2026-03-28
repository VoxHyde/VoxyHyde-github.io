class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    generate() {
        // Logic to generate a new obstacle at a random position
        this.x = Math.random() * (canvas.width - this.width);
        this.y = 0; // Start from the top of the canvas
    }

    draw(context) {
        context.fillStyle = 'red'; // Color of the obstacle
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update(speed) {
        this.y += speed; // Move the obstacle down the screen
    }
}

export default Obstacle;