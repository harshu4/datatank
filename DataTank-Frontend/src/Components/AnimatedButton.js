import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";
import ClipLoader from "react-spinners/ClipLoader";

const Particle = ({ x, y, size }) => (
  <div
    className="overflow-hidden"
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#0074D9",
      backgroundImage: 'url("/filecoin.png")',
      backgroundSize: "contain",
      position: "absolute",
      top: y,
      left: x,
    }}
  />
);

function AnimatedButton({ onClickCB, loadingST }) {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [btnHW, setBtnHW] = useState({});

  const animProps = useSpring({
    x: hovered ? 10 : 0,
    background: hovered
      ? "linear-gradient(to right, #00bfff, #7a00ff)"
      : "linear-gradient(to right, #7a00ff, #00bfff)",
  });

  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          return {
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
          };
        })
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles]);

  useEffect(() => {
    if(!loadingST){
      setLoading(false);
      return;
    }
    const { x, y } = buttonRef.current.getBoundingClientRect();
    const h = buttonRef.current.clientHeight;
    const w = buttonRef.current.clientWidth;
    setBtnHW({ h, w });
    const newParticles = [];
    for (let i = 0; i < w / 10; i++) {
      for (let j = 0; j < h / 10; j++) {
        const xx = x + i + 50;
        const yy = y + j + 5;
        const size = 10 + Math.random() * 20;
        const vx = -5 + Math.random() * 10;
        const vy = -5 + Math.random() * 10;
        newParticles.push({ x: xx, y: yy, size, vx, vy });
      }
    }
    setParticles(newParticles);
    setLoading(true);
  }, [loadingST]);

  const handleClick = () => {
    onClickCB();
  };

  return (
    <>
      <div className="absolute top-0 left-0 overflow-hidden w-full h-full -z-50">
        {particles.map((particle, index) => (
          <Particle
            key={index}
            x={particle.x}
            y={particle.y}
            size={particle.size}
          />
        ))}
      </div>
      {loading ? (
        <div
          style={{ height: btnHW.h, width: btnHW.w }}
          className="flex items-center justify-center "
        >
          <ClipLoader
            color={"#ffffff"}
            loading={true}
            size={48}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <animated.div
          ref={buttonRef}
          className="cursor-pointer select-none px-8 py-2 rounded-lg font-mono font-semibold text-white text-lg"
          style={{
            width: "fit-content",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: animProps.background,
          }}
          onMouseEnter={() => setHovered(true)}
          onClick={handleClick}
          onMouseLeave={() => setHovered(false)}
        >
          Launch App
        </animated.div>
      )}
    </>
  );
}

export default AnimatedButton;
