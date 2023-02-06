import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-web';

const Spinner = () =>{
    const buttonRef = useRef(null);

    useEffect(() => {
        if (buttonRef.current) {
          const spinner = Lottie.loadAnimation({
            container: buttonRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: require('../animation.json'), // The JSON file with the animation data
          });
        }
    }, [buttonRef]);

    return(
        <>
          <div ref={buttonRef} />
        </>
    )
}

export default Spinner;