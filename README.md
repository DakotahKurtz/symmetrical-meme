Javascript program to showcase the magic of the discrete fourier transform.
I saw the 3blue1brown Youtube video at:

https://www.youtube.com/watch?v=r6sGWTCMz2k 

that describes using the Fourier Transform to draw closed paths with rotating vectors, and had to explore the idea myself. 
This project is the result of that exploration.

The user can draw any closed shape (or choose from several more complex pre-designed options) - that shape will then be rendered using 
a sum of rotating vectors. The number of vectors used is adjustable, which changes the accuracy of the approximation. The animation shows the vectors tracing out
the path, and both the zoom and speed of animation is a adjustable. 

The graphics are displayed using the Javascript Canvas API, and UI is of course CSS/HTML.
