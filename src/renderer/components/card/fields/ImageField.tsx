import React, { useState, useEffect, useRef } from 'react';
import type { FieldDefinition } from '../../../../shared/types';
import { api } from '../../../api';


interface ImageFieldProps {
  field: FieldDefinition;
  value: string | null; // Image ID
  onChange?: (value: string | null) => void;
  readOnly?: boolean;
}


export function ImageField({ field, value, onChange, readOnly }: ImageFieldProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (value) {
      loadImage(value);
    } else {
      setImageUrl(null);
    }
  }, [value]);


  async function loadImage(imageId: string) {
    setIsLoading(true);
    try {
      const url = await api.images.get(imageId);
      setImageUrl(url);
    } catch (error) {
      console.error('Failed to load image:', error);
    } finally {
      setIsLoading(false);
    }
  }


  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;


    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }


    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('File must be an image');
      return;
    }


    setIsLoading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
       
        // Upload to database
        const imageId = await api.images.upload(base64Data);
       
        // Update field value
        onChange?.(imageId);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  }


  function handleRemove() {
    if (value) {
      // Optionally delete from database
      // api.images.delete(value);
      onChange?.(null);
    }
  }


  if (readOnly) {
    if (!imageUrl) {
      return <div className="text-gray-500 italic">No image</div>;
    }
    return (
      <div className="rounded-lg overflow-hidden border border-gray-600">
        <img src={imageUrl} alt={field.label} className="w-full h-auto" />
      </div>
    );
  }


  return (
    <div>
      {imageUrl ? (
        <div className="space-y-2">
          <div className="rounded-lg overflow-hidden border border-gray-600">
            <img src={imageUrl} alt={field.label} className="w-full h-auto" />
          </div>
          <button
            onClick={handleRemove}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            🗑️ Remove Image
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 px-4 py-8 rounded-lg border-2 border-dashed border-gray-600 transition-colors"
          >
            {isLoading ? 'Uploading...' : '📷 Upload Image'}
          </button>
          <div className="text-xs text-gray-500 mt-2">
            Max 5MB. Supported: JPG, PNG, GIF
          </div>
        </div>
      )}
    </div>
  );
}
