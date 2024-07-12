class Complex {
    i;
    r;
    constructor(r, i) {
        this.r = r;
        this.i = i;
    }

    add(c) {
        return new Complex(c.r + this.r, c.i + this.i);
    }

    mulitply(c) {
       var n_r = (this.r * c.r) - (this.i * c.i);
       var n_i = (this.r * c.i) + (this.i * c.r);
        return new Complex(n_r, n_i);
    }

    static euler(positive, theta) {
        var r = Math.cos(theta);
        var i = Math.sin(theta);
        if (positive) {
            return new Complex(r, i);
        } else {
            return new Complex(r, -i);
        }
    }

    toString() {
        let s = "complex: " + this.r;
        if (this.i == 0) {
            return s;
        } else if (this.i < 0) {
            s += " - " + -(this.i) + "i";
        } else {
            s += " + " + this.i + "i";
        }
        return s;

        
    }
}

class Vector {
    scaledIndex;
    radius;
    offset;

    constructor(index, complex) {
        this.scaledIndex = index;
        this.radius = Math.sqrt((complex.r * complex.r + complex.i * complex.i));
        let theta = Math.atan2(complex.i, complex.r);
        this.offset = theta > 0 ? theta : theta + 2 * Math.PI;
    }

    toString(){
        let s = "vector-> ";
        s += "scaled_index: " + this.scaledIndex + " | r: " + this.radius + " | o: " + this.offset; 
        return s;
    }

    static compareRadii(a, b) {
        return b.radius - a.radius;
    }
}

class Transformation {
    N;
    vectors;
    points;

     constructor(inputs) {
       this.N = inputs.length;
        this.vectors = [];
        this.points = [];

        for (let i = 0; i < this.N; i++) {
            this.points.push(new Complex(inputs[i][0], inputs[i][1]));
        }

        var scaledIndex;
        var temp;

        for (let k = 0; k < this.N; k++) {
            temp = new Complex(0, 0);
            scaledIndex = k - Math.floor(this.N / 2);
            for (let n = 0; n < this.N; n++) {
                temp = temp.add(this.points[n].mulitply(Complex.euler(false, scaledIndex * ((2 * Math.PI) / this.N) * n)));
            }
            this.vectors.push(new Vector(scaledIndex, temp.mulitply(new Complex(1.0 / this.N, 0))));
        
        }

        // order vectors by radii, descending values
        this.vectors.sort(Vector.compareRadii);
    }

    getVectors(n) {
        return this.vectors.slice(0, n);
    }

    size() {
        return this.vectors.length;
    }


}


