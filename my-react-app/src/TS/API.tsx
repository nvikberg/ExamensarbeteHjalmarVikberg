// components/SeasonalPhotoSearcher.tsx
import React, { useState, useEffect } from 'react';
import { createClient, Photo, PhotosWithTotalResults, ErrorResponse } from 'pexels';

const client = createClient('LPR2D1WWMHOTpJrhx7mxWVvHNCtRyVxHlZbujV3V9NpCkcjqhk6PYDwZ');

const getSeasonalPhotoTitle = (): string => {
    const month = new Date().getMonth();
    if (month >= 11 || month <= 1) return 'Winter Landscape';
    if (month >= 2 && month <= 4) return 'Spring Bloom';
    if (month >= 5 && month <= 7) return 'Summer Beach';
    return 'Autumn Leaves';
};

interface SeasonPhotoDataProp{
    onPhotoFetched: (url: string) => void;
}


const SeasonalPhoto: React.FC<SeasonPhotoDataProp> = ({ onPhotoFetched }) => {
    const seasonalTitle = getSeasonalPhotoTitle();

    const fetchSeasonalPhoto = async () => {
        try {
            const response = await client.photos.search({ query: seasonalTitle, per_page: 1 });

            if ('photos' in response && response.photos.length > 0) {
                    const fetchedPhoto = response.photos[0];
                    onPhotoFetched(fetchedPhoto.src.original);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchSeasonalPhoto();
    }, [seasonalTitle]);


    return (
        <div>
            <p>Currently showing: <strong>{seasonalTitle}</strong></p>
        </div>
    );
};

export default SeasonalPhoto;
