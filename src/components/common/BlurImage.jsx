import React from 'react';
import classes from './BlurImage.module.css';

const BlurImage = ({ image, alt = 'Product Image' }) => {
    // Return image with blur background. Used for different image sizes.
    
    // Ensure we have a valid image source
    const imageSrc = (!image || image === '' || image.trim() === '') 
        ? 'https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg' 
        : image;

    return (
        <div className={classes.container}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={classes.blurIMG} alt={alt} src={imageSrc} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={classes.finalIMG} alt={alt} src={imageSrc} />
        </div>
    );
};

export default BlurImage;
