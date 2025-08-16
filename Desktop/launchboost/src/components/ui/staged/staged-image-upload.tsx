"use client";

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Check, AlertCircle, FileImage } from 'lucide-react';

interface StagedImageUploadProps {
  onFileSelect?: (file: File | null) => void;
  folder?: string;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  label?: string;
  description?: string;
}

export interface StagedImageUploadRef {
  uploadToCloud: () => Promise<string | null>;
  clearFile: () => void;
  hasFile: () => boolean;
}

export const StagedImageUpload = forwardRef<StagedImageUploadRef, StagedImageUploadProps>(({
  onFileSelect,
  folder = 'general',
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  label = 'Upload Image',
  description = 'Upload an image file (JPEG, PNG, WebP, GIF - max 5MB)'
}, ref) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
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

  const handleFileSelect = (file: File) => {
    console.log('=== FILE SELECT DEBUG ===');
    console.log('File selected:', file.name, file.size, file.type);
    
    const validationError = validateFile(file);
    if (validationError) {
      console.log('Validation error:', validationError);
      setError(validationError);
      return;
    }

    setError('');
    setSelectedFile(file);
    console.log('File set successfully, selectedFile updated');

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Notify parent component
    console.log('Calling onFileSelect callback');
    onFileSelect?.(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect?.(null);
  };

  const uploadToCloud = async (): Promise<string | null> => {
    console.log('=== UPLOAD TO CLOUD DEBUG ===');
    console.log('uploadToCloud called, selectedFile:', selectedFile?.name || 'null');
    
    if (!selectedFile) {
      console.log('No selectedFile, returning null');
      return null;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);
    console.log('Starting upload process...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
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
        return result.url;
      } else {
        setError(result.error || 'Upload failed. Please try again.');
        return null;
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    uploadToCloud,
    clearFile,
    hasFile: () => {
      const hasFile = selectedFile !== null;
      console.log('hasFile() called, selectedFile:', selectedFile?.name || 'null', 'result:', hasFile);
      return hasFile;
    }
  }));

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
                  alt="Selected preview"
                  className="w-full h-48 object-cover rounded-lg bg-gray-100"
                />
                {!isUploading && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <FileImage className="h-4 w-4" />
                <span className="text-sm font-medium">
                  File selected: {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                </span>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  <strong>Ready to upload:</strong> This image will be uploaded to cloud storage when you submit your deal.
                </p>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">Uploading... {uploadProgress}% complete</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Drop image here or click to select
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(maxSize)} max • {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
                </p>
                <p className="text-xs text-blue-600">
                  💡 File will be uploaded when you submit your deal
                </p>
              </div>
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
          {selectedFile ? 'Change File' : 'Choose File'}
        </Button>
        
        {selectedFile && !isUploading && (
          <Button
            variant="destructive"
            onClick={clearFile}
            className="px-4"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});

StagedImageUpload.displayName = 'StagedImageUpload';