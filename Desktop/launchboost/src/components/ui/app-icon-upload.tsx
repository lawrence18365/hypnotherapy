"use client";

import React, { useState, useRef } from 'react';
import { ImageUpload, ImageUploadRef } from '@/components/ui/image-upload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

interface AppIconUploadProps {
  onUpload: (url: string) => void;
  currentIcon?: string;
  appName?: string;
  className?: string;
  staged?: boolean; // New prop to control staging
  onFileStaged?: (file: File | null) => void;
}

export interface AppIconUploadRef {
  uploadStagedFile: () => Promise<string | null>;
}

export const AppIconUpload = React.forwardRef<AppIconUploadRef, AppIconUploadProps>(({
  onUpload,
  currentIcon,
  appName = 'App',
  className = '',
  staged = false,
  onFileStaged
}, ref) => {
  const [uploadedIcon, setUploadedIcon] = useState(currentIcon);
  const imageUploadRef = useRef<ImageUploadRef>(null);

  const handleUpload = (url: string) => {
    setUploadedIcon(url);
    onUpload(url);
  };

  // Expose uploadStagedFile to parent component
  React.useImperativeHandle(ref, () => ({
    uploadStagedFile: async () => {
      return imageUploadRef.current?.uploadStagedFile() || null;
    }
  }), []);

  const iconSizes = [
    { size: '32x32', label: 'Small', icon: Smartphone },
    { size: '64x64', label: 'Medium', icon: Tablet },
    { size: '128x128', label: 'Large', icon: Monitor },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">App Icon</h3>
        <p className="text-sm text-muted-foreground">
          Upload a high-quality icon for {appName}. Recommended: 512x512px, square format.
        </p>
      </div>

      <ImageUpload
        ref={imageUploadRef}
        onUpload={handleUpload}
        currentImage={uploadedIcon}
        folder="app-icons"
        maxSize={2 * 1024 * 1024} // 2MB for icons
        acceptedTypes={['image/png', 'image/jpeg', 'image/webp']}
        label="Icon Upload"
        description="PNG, JPEG, or WebP - max 2MB. Square format recommended for best results."
        staged={staged}
        onFileStaged={onFileStaged}
      />

      {uploadedIcon && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Icon Ready
            </Badge>
            <span className="text-sm text-muted-foreground">
              Your app icon will appear across the platform
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            {iconSizes.map(({ size, label, icon: Icon }) => (
              <div key={size} className="text-center space-y-2">
                <div className="mx-auto bg-white rounded-lg shadow-sm p-2 w-fit">
                  <img
                    src={uploadedIcon}
                    alt={`${appName} icon ${size}`}
                    className={`rounded-lg ${
                      size === '32x32' ? 'w-8 h-8' :
                      size === '64x64' ? 'w-16 h-16' :
                      'w-24 h-24'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <Icon className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">{label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{size}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Icon Guidelines</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use a square format (1:1 aspect ratio)</li>
              <li>• Ensure high contrast and clear visibility</li>
              <li>• Avoid text that might be hard to read at small sizes</li>
              <li>• Test how it looks on both light and dark backgrounds</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

AppIconUpload.displayName = 'AppIconUpload';