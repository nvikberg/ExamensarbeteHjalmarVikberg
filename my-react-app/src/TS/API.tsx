import React, { useState } from 'react';
import { createClient, Photo, PhotosWithTotalResults, ErrorResponse } from 'pexels';
import styles from '../CSS/Homepage.module.css'

//API från Pexels där vi hämtar 10 random landscape bilder för att använda i våra tavlor
//api nycklen är sparad i env och gitignore
//hade problem med useEffect här så vi skippade det 

const apiKey = process.env.REACT_APP_PEXELS_API_KEY;
if (!apiKey) {
  throw new Error("Pexels API key is missing! Please set REACT_APP_PEXELS_API_KEY in your environment variables.");
}

// Use the API key to create the client
const client = createClient(apiKey);
const SeasonalPhoto: React.FC<{ onPhotosFetched: (photos: string[]) => void }> = ({ onPhotosFetched }) => {
  const [photosArray, setPhotosArray] = useState<Photo[]>([]);

  const fetchPhotos = async () => {
    try {
      const response = await client.photos.search({
        query: 'landscape',  //query specifikationer for att hämta bilderna 
        orientation: 'landscape',
        per_page: 10,
      });

      //kollar om respone med 'PhotosWithTotalResults'
      if ('photos' in response) {
        //if response has 'photos', set the photos array
      
        setPhotosArray(response.photos);
      } else {
        // Handle the error response
        console.error('Error fetching photos:', response);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const selectRandomPhoto = () => {
    if (photosArray.length > 0) {
      //random select a photo and call `onPhotosFetched` with the single image URL
      const randomPhoto = photosArray[Math.floor(Math.random() * photosArray.length)].src.original;
      onPhotosFetched([randomPhoto]); // Pass an array with a single image URL
    }
  };


  //fetchPhotos when component is mounted or whenever you want to fetch photos
  if (photosArray.length === 0) {
    fetchPhotos();
  }

  return (
    <div>
      <button className={styles.randomBackgroundButton} onClick={selectRandomPhoto}>Click to Select Random Background</button>
    </div>
  );
};

export default SeasonalPhoto;
