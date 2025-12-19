import React, { useEffect, useRef } from 'react';

const FireBanner = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            // Set canvas size to match parent container (which will match the image)
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height;
                this.size = Math.random() * 20 + 10;
                this.speedY = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 2;
                this.life = 100;
                this.opacity = Math.random() * 0.5 + 0.2;
                // Fire colors: Red, Orange, Yellow
                const colors = ['255, 69, 0', '255, 140, 0', '255, 215, 0'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                this.life -= 1.5;
                this.size *= 0.95; // Shrink

                if (this.life <= 0 || this.size <= 0.5) {
                    this.reset();
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${this.life / 100 * this.opacity})`;
                ctx.fill();

                // Add glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${this.color}, 0.5)`;
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 50; // Start slightly below
                this.size = Math.random() * 15 + 5;
                this.speedY = Math.random() * 2 + 1;
                this.life = 100;
            }
        }

        const initParticles = () => {
            particles = [];
            const numberOfParticles = Math.floor(canvas.width / 5); // Responsive particle count
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            // Clear with a slight transparency for trail effect (optional, but clean clear is better for overlay)
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Reset shadow for other drawings if any (though we only draw particles)
            ctx.shadowBlur = 0;

            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="relative w-full h-full flex justify-center items-center group perspective-1000">
            {/* The Image */}
            <img
                src="/arts_banner__.png"
                alt="Arts Festival Banner"
                className="w-auto h-auto md:max-h-[500px] object-contain relative z-10 transition-transform duration-700 group-hover:scale-105"
            />

            {/* Fire Overlay */}
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 mix-blend-screen opacity-80"
            />

            {/* Optional: Add a subtle red bottom glow container */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-red-900/40 to-transparent z-0 blur-xl pointer-events-none"></div>
        </div>
    );
};

export default FireBanner;
