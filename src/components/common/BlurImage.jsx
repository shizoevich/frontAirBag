import React from 'react';
import classes from './BlurImage.module.css';

const BlurImage = ({ image, alt = 'Product Image' }) => {
    // Return image with blur background. Used for different image sizes.

    if (!image) { // No image - use default placeholder
        image = 'https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg';
    }

    return (
        <div className={classes.container}>
            <img className={classes.blurIMG} alt={alt} src={image} />
            <img className={classes.finalIMG} alt={alt} src={image} />
        </div>
    );
};

export default BlurImage;
