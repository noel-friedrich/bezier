class Vector {

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    add(other) {
        return new Vector(
            this.x + other.x,
            this.y + other.y
        )
    }

    negate() {
        return new Vector(
            -this.x,
            -this.y
        )
    }

    sub(other) {
        return this.add(other.negate())
    }

    scale(scalar) {
        return new Vector(
            this.x * scalar,
            this.y * scalar
        )
    }

    dot(other) {
        return this.x * other.x + this.y * other.y
    }

    cross(other) {
        return this.x * other.y - this.y * other.x
    }

    get angle() {
        return Math.atan2(this.y, this.x)
    }

    get angleDeg() {
        return this.angle * 180 / Math.PI
    }

    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2)
    }

    get normalised() {
        return this.scale(1 / this.length)
    }

    copy() {
        return new Vector(this.x, this.y)
    }

}
