import React, { useState } from 'react';

// Interactive Rating Stars Component
const StarRatingBox = ({ currentRating = 0, onRatingChange, starImage, disabled = false }) => {
    const [hoverRating, setHoverRating] = useState(0);

    // Handle star click - supports half and full stars
    const handleStarClick = (starIndex, isLeftHalf) => {
        if (disabled) return;
        
        const newRating = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
        onRatingChange(newRating);
    };

    // Handle star hover
    const handleStarHover = (starIndex, isLeftHalf) => {
        if (disabled) return;
        
        const newHoverRating = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
        setHoverRating(newHoverRating);
    };

    // Clear hover effect
    const handleMouseLeave = () => {
        if (disabled) return;
        setHoverRating(0);
    };

    // Get star fill state for left and right halves
    const getStarHalfOpacity = (starIndex, isLeftHalf) => {
        const activeRating = hoverRating || currentRating;
        
        if (isLeftHalf) {
            // Left half: show if rating is >= starIndex + 0.5
            return activeRating >= starIndex + 0.5 ? 1 : 0.3;
        } else {
            // Right half: show only if rating is >= starIndex + 1 (full star)
            return activeRating >= starIndex + 1 ? 1 : 0.3;
        }
    };

    return (
        <div 
            className={`flex justify-around ${disabled ? 'opacity-50' : ''}`}
            onMouseLeave={handleMouseLeave}
        >
            {[0, 1, 2, 3, 4].map((starIndex) => (
                <div 
                    key={starIndex}
                    className={`relative inline-block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ height: '2.2rem', width: '2.2rem' }}
                >
                    {/* Left half star image */}
                    <img 
                        src={starImage}
                        alt="star left"
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        style={{
                            opacity: getStarHalfOpacity(starIndex, true),
                            transition: 'opacity 0.1s ease',
                            clipPath: 'inset(0 50% 0 0)' // Show only left half
                        }}
                    />
                    
                    {/* Right half star image */}
                    <img 
                        src={starImage}
                        alt="star right"
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        style={{
                            opacity: getStarHalfOpacity(starIndex, false),
                            transition: 'opacity 0.1s ease',
                            clipPath: 'inset(0 0 0 50%)' // Show only right half
                        }}
                    />
                    
                    {/* Left half clickable area */}
                    <div
                        className="absolute top-0 left-0 w-1/2 h-full z-10"
                        onMouseEnter={() => handleStarHover(starIndex, true)}
                        onClick={() => handleStarClick(starIndex, true)}
                        style={{ pointerEvents: disabled ? 'none' : 'auto' }}
                    />
                    
                    {/* Right half clickable area */}
                    <div
                        className="absolute top-0 right-0 w-1/2 h-full z-10"
                        onMouseEnter={() => handleStarHover(starIndex, false)}
                        onClick={() => handleStarClick(starIndex, false)}
                        style={{ pointerEvents: disabled ? 'none' : 'auto' }}
                    />
                </div>
            ))}
        </div>
    );
};

export default StarRatingBox