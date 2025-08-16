"use client";

import { useState, useCallback } from 'react';

interface UploadResult {
  url: string;
  fileName: string;
  size: number;
  type: string;
}

interface UploadOptions {
  folder?: string;
  maxSize?: number;
  acceptedTypes?: string[];
}

interface UseImageUploadReturn {
  uploadImage: (file: File, options?: UploadOptions) => Promise<UploadResult>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  clearError: () => void;
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  folder: 'general',
  maxSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
};

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateFile = useCallback((file: File, options: Required<UploadOptions>): void => {
    // Check file type
    if (!options.acceptedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Accepted types: ${options.acceptedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > options.maxSize) {
      const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(1);
      throw new Error(`File too large. Maximum size is ${maxSizeMB}MB.`);
    }

    // Check if file is actually an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image.');
    }
  }, []);

  const uploadImage = useCallback(async (
    file: File, 
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    const finalOptions = { ...DEFAULT_OPTIONS, ...options };
    
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Validate file
      validateFile(file, finalOptions);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', finalOptions.folder);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Upload to Cloudflare R2
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Validate response
      if (!result.url || !result.fileName) {
        throw new Error('Invalid response from upload service');
      }

      return {
        url: result.url,
        fileName: result.fileName,
        size: result.size,
        type: result.type,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [validateFile]);

  return {
    uploadImage,
    isUploading,
    progress,
    error,
    clearError,
  };
}

// Specialized hooks for common use cases
export function useAppIconUpload(): UseImageUploadReturn {
  const baseUpload = useImageUpload();
  
  const uploadAppIcon = useCallback(async (file: File): Promise<UploadResult> => {
    return baseUpload.uploadImage(file, {
      folder: 'app-icons',
      maxSize: 2 * 1024 * 1024, // 2MB for icons
      acceptedTypes: ['image/png', 'image/jpeg', 'image/webp'], // PNG preferred for icons
    });
  }, [baseUpload]);

  return {
    ...baseUpload,
    uploadImage: uploadAppIcon,
  };
}

export function useDealImageUpload(): UseImageUploadReturn {
  const baseUpload = useImageUpload();
  
  const uploadDealImage = useCallback(async (file: File): Promise<UploadResult> => {
    return baseUpload.uploadImage(file, {
      folder: 'deal-images',
      maxSize: 5 * 1024 * 1024, // 5MB for promotional images
      acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    });
  }, [baseUpload]);

  return {
    ...baseUpload,
    uploadImage: uploadDealImage,
  };
}

export function useProfileImageUpload(): UseImageUploadReturn {
  const baseUpload = useImageUpload();
  
  const uploadProfileImage = useCallback(async (file: File): Promise<UploadResult> => {
    return baseUpload.uploadImage(file, {
      folder: 'profile-images',
      maxSize: 1 * 1024 * 1024, // 1MB for profile pics
      acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    });
  }, [baseUpload]);

  return {
    ...baseUpload,
    uploadImage: uploadProfileImage,
  };
}