import { useState } from 'react';
import { ProcessImage } from '@/components/processimage';

export default function ProcessImagePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Handle the file input change event
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImageFile(event.target.files[0]);
    }
  };

  // Handle the completion of image processing
  const handleComplete = (docId?: string) => {
    console.log("Processing complete", docId);
    // Handle completion logic here
  };

  return (
    <div>
      {/* File input for selecting an image */}
      <input type="file" onChange={handleImageChange} />
      {/* Render the ProcessImage component if an image file is selected */}
      {imageFile && <ProcessImage imageFile={imageFile} onComplete={handleComplete} />}
    </div>
  );
}