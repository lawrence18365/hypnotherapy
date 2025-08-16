"use client";

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Check, AlertCircle, FileImage } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  folder?: string;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  label?: string;
  description?: string;
  staged?: boolean; // New prop: if true, only preview file, don't upload immediately
  onFileStaged?: (file: File | null) => void; // Callback when file is selected for staging
}

export interface ImageUploadRef {
  uploadStagedFile: () => Promise<string | null>;
}

export const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(({
  onUpload,
  currentImage,
  folder = 'general',
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  label = 'Upload Image',
  description = 'Upload an image file (JPEG, PNG, WebP, GIF - max 5MB)',
  staged = false,
  onFileStaged
}, ref) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentImage || null);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${formatFileSize(maxSize)}.`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError('');
    setSuccess(false);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setUploadedUrl(result.url); // Store R2 URL for backend
        // Keep the local preview for display (don't change preview)
        onUpload(result.url); // Pass R2 URL to parent component
        
        // Reset success state after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Upload failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    if (staged) {
      // Staged mode: store file for later upload
      setStagedFile(file);
      onFileStaged?.(file);
      setError(''); // Clear any previous errors
    } else {
      // Immediate mode: upload right away
      await uploadFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setUploadedUrl(null);
    setStagedFile(null);
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileStaged?.(null); // Notify parent that file was removed
  };

  // Function to upload staged file (called externally)
  const uploadStagedFile = async (): Promise<string | null> => {
    if (!stagedFile) return null;
    
    return new Promise((resolve, reject) => {
      uploadFile(stagedFile)
        .then(() => {
          // Wait for the upload to complete and get the URL
          setTimeout(() => resolve(uploadedUrl), 100);
        })
        .catch(() => reject(new Error('Upload failed')));
    });
  };

  // Expose uploadStagedFile to parent component
  useImperativeHandle(ref, () => ({
    uploadStagedFile
  }), [stagedFile, uploadedUrl]);

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <div>
          <Label className="text-base font-semibold">{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      <Card 
        className={`relative transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-dashed border-gray-300'
        } ${isUploading ? 'pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          {preview ? (
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src={preview}
                  alt="Uploaded preview"
                  className="w-full h-48 object-cover rounded-lg bg-gray-100"
                />
                {!isUploading && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {staged && stagedFile && (
                <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <FileImage className="h-4 w-4" />
                  <span className="text-sm font-medium">File ready for upload (will upload when deal is submitted)</span>
                </div>
              )}
              
              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">Upload successful! Image saved to cloud storage.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                {isUploading ? (
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {isUploading ? 'Uploading...' : 'Drop image here or click to upload'}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(maxSize)} max • {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
                </p>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
                </div>
              )}
            </div>
          )}

          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          <FileImage className="h-4 w-4 mr-2" />
          Choose File
        </Button>
        
        {preview && !isUploading && (
          <Button
            variant="destructive"
            onClick={removeImage}
            className="px-4"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';