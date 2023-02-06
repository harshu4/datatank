import React, { useState, useEffect } from 'react';
import { useSpring, animated } from "react-spring";

const Brush = () => {
  const [brushLines, setBrushLines] = useState([
    {
      top: 10,
      left: 10,
      width: 20,
      height: 20,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      spawn: true
    }
  ]);
  const [isVisible, setIsVisible] = useState(false);


  const animationProps = useSpring({
    opacity: isVisible ? 1 : 0,
  });

  useEffect(() => {
    let interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(()=>{
        let newBrushLines = brushLines.map((brushLine) => {
          brushLine.top = Math.random() * 70;
          brushLine.left = Math.random() * 70;
          brushLine.width = Math.random() * 40 + 20;
          brushLine.height = Math.random() * 40 + 20;
          brushLine.color = `hsl(${Math.random() * 360}, 100%, 50%)`
          brushLine.spawn = Math.random() > 0.5;
          return brushLine;
        });
        setBrushLines(newBrushLines);
        setIsVisible(true)
      }, 500)

    }, 1500);

    return () => {
      clearInterval(interval);
    };
  }, [brushLines]);

  return (
    <div className='absolute top-0 left-0 overflow-hidden w-full h-full -z-50'>
      {brushLines.map((brushLine, index) => (
        <animated.div
          key={index}
          style={{
            ...animationProps,
            position: 'absolute',
            top: brushLine.top + '%',
            left: brushLine.left + '%',
            width: brushLine.width + '%',
            height: brushLine.height + '%'
          }}
        >
          {Array(Math.ceil(brushLine.width * brushLine.height))
            .fill()
            .map((_, dotIndex) => (
              <span
                key={dotIndex}
                style={{
                  display: 'inline-block',
                  width: 5,
                  height: 5,
                  margin: 5,
                  background: `linear-gradient(to right, ${brushLine.color} 0%, transparent 100%)`,
                  opacity: brushLine.spawn ? 1 : 0
                }}
              />
            ))}
        </animated.div>
      ))}
    </div>
  );
};

export default Brush;