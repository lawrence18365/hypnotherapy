# Cloudflare R2 Image Hosting Documentation

## Overview

LaunchBoost uses Cloudflare R2 for secure, scalable image hosting. This system handles app icons, deal images, profile pictures, and other assets with automatic compression, security validation, and CDN delivery.

## Features

- **Secure Upload**: AWS S3-compatible authentication with custom signatures
- **File Validation**: Type checking, size limits, security scanning
- **Organized Storage**: User-based folder structure with timestamps
- **CDN Delivery**: Fast global content delivery through Cloudflare
- **Custom Domains**: Support for branded image URLs
- **Cost Effective**: Cloudflare R2 provides free tier with generous limits

## Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```bash
# Required
CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key

# Optional
CLOUDFLARE_R2_BUCKET_NAME=launchboost-uploads
CLOUDFLARE_R2_PUBLIC_URL=https://assets.yoursite.com
```

### Setup Steps

1. **Create Cloudflare R2 Bucket**
   - Login to Cloudflare Dashboard
   - Navigate to R2 Object Storage
   - Create bucket named `launchboost-uploads`

2. **Generate API Token**
   - Go to "Manage R2 API tokens"
   - Create token with "Object Read & Write" permissions
   - Copy Account ID, Access Key ID, and Secret Access Key

3. **Configure Custom Domain (Optional)**
   - Add custom domain to R2 bucket
   - Update `CLOUDFLARE_R2_PUBLIC_URL` in environment

## API Endpoints

### Upload Image

**POST** `/api/upload`

Upload an image file to Cloudflare R2 storage.

#### Request Format

```typescript
FormData {
  file: File        // Image file (JPEG, PNG, WebP, GIF)
  folder?: string   // Storage folder (default: 'general')
}
```

#### Response Format

```typescript
{
  success: true,
  url: string,        // Public URL to the image
  fileName: string,   // Stored filename with path
  size: number,       // File size in bytes
  type: string        // MIME type
}
```

#### Validation Rules

- **File Types**: JPEG, PNG, WebP, GIF only
- **File Size**: Maximum 5MB (2MB for icons)
- **Authentication**: User must be logged in
- **Rate Limiting**: 3 uploads per hour per user/IP

### Get Upload Configuration

**GET** `/api/upload`

Returns upload configuration and status.

```typescript
{
  configured: boolean,
  maxSize: number,
  allowedTypes: string[],
  bucket: string
}
```

## React Components

### Basic Image Upload

```typescript
import { ImageUpload } from '@/components/ui/image-upload';

function MyComponent() {
  const handleUpload = (url: string) => {
    console.log('Image uploaded:', url);
  };

  return (
    <ImageUpload
      onUpload={handleUpload}
      folder="my-images"
      maxSize={5 * 1024 * 1024}
      acceptedTypes={['image/jpeg', 'image/png']}
      label="Upload Your Image"
      description="JPEG or PNG - max 5MB"
    />
  );
}
```

### App Icon Upload

```typescript
import { AppIconUpload } from '@/components/ui/app-icon-upload';

function AppForm() {
  const [iconUrl, setIconUrl] = useState('');

  return (
    <AppIconUpload
      onUpload={setIconUrl}
      currentIcon={iconUrl}
      appName="My SaaS App"
    />
  );
}
```

## Custom Hooks

### useImageUpload

Basic image upload functionality:

```typescript
import { useImageUpload } from '@/hooks/use-image-upload';

function MyComponent() {
  const { uploadImage, isUploading, progress, error } = useImageUpload();

  const handleFileSelect = async (file: File) => {
    try {
      const result = await uploadImage(file, {
        folder: 'custom-folder',
        maxSize: 2 * 1024 * 1024,
        acceptedTypes: ['image/png', 'image/jpeg']
      });
      
      console.log('Upload successful:', result.url);
    } catch (err) {
      console.error('Upload failed:', err.message);
    }
  };

  return (
    <div>
      {isUploading && <p>Progress: {progress}%</p>}
      {error && <p>Error: {error}</p>}
      <input type="file" onChange={(e) => handleFileSelect(e.target.files[0])} />
    </div>
  );
}
```

### Specialized Hooks

```typescript
// App icons (2MB limit, PNG preferred)
const { uploadImage } = useAppIconUpload();

// Deal promotional images (5MB limit)
const { uploadImage } = useDealImageUpload();

// Profile pictures (1MB limit)
const { uploadImage } = useProfileImageUpload();
```

## Folder Structure

Images are organized by folder and user:

```
bucket/
├── app-icons/
│   └── {user-id}/
│       └── {timestamp}-{random}.{ext}
├── deal-images/
│   └── {user-id}/
│       └── {timestamp}-{random}.{ext}
├── profile-images/
│   └── {user-id}/
│       └── {timestamp}-{random}.{ext}
└── general/
    └── {user-id}/
        └── {timestamp}-{random}.{ext}
```

## Security Features

### File Validation

- **Type Checking**: Only allowed image formats
- **Size Limits**: Configurable maximum file sizes
- **Content Scanning**: Basic security validation
- **Extension Validation**: Matches MIME type with extension

### Access Control

- **Authentication Required**: Users must be logged in
- **User Isolation**: Files organized by user ID
- **Rate Limiting**: Prevents abuse and spam
- **IP Tracking**: Logs submission IP addresses

### Upload Security

- **AWS Signature V4**: Secure authentication for R2
- **Unique Filenames**: Prevents conflicts and guessing
- **Content-Type Validation**: Prevents malicious uploads
- **Request Size Limits**: Protects against large payloads

## Error Handling

### Common Errors

```typescript
// File too large
{ error: "File too large. Maximum size is 5MB." }

// Invalid file type
{ error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }

// Authentication required
{ error: "Authentication required" }

// Rate limited
{ error: "Too many submissions. Please wait before submitting another deal." }

// Configuration missing
{ error: "Cloudflare R2 not configured. Please add environment variables." }

// Upload failed
{ error: "Upload failed. Please try again." }
```

### Handling in Components

```typescript
const { uploadImage, error, clearError } = useImageUpload();

// Clear errors when user retries
const handleRetry = () => {
  clearError();
  // ... retry logic
};

// Display user-friendly error messages
{error && (
  <div className="error-message">
    {error}
    <button onClick={handleRetry}>Try Again</button>
  </div>
)}
```

## Performance Optimization

### Best Practices

1. **Image Compression**: Recommend WebP format when possible
2. **Size Limits**: Appropriate limits for each use case
3. **Lazy Loading**: Use `loading="lazy"` for image elements
4. **CDN Caching**: Configure proper cache headers
5. **Progressive Upload**: Show progress during upload

### Recommended Image Specs

- **App Icons**: 512x512px, PNG format, under 2MB
- **Deal Images**: 1200x600px, JPEG/WebP, under 5MB
- **Profile Pictures**: 400x400px, JPEG/WebP, under 1MB
- **General Images**: Optimized for web, under 5MB

## Monitoring and Analytics

### Upload Metrics

The system logs:
- Upload success/failure rates
- File sizes and types
- User activity patterns
- Error frequencies

### Health Checks

Monitor these endpoints:
- `/api/upload` (GET) - Configuration status
- Cloudflare R2 API connectivity
- CDN response times

## Cost Management

### Cloudflare R2 Pricing

- **Storage**: $0.015/GB/month
- **Operations**: $4.50/million writes, $0.36/million reads
- **Free Tier**: 10GB storage, 1 million writes, 10 million reads per month

### Optimization Tips

1. **Image Compression**: Reduce file sizes before upload
2. **Cleanup Strategy**: Remove unused images periodically
3. **CDN Efficiency**: Use custom domains for better caching
4. **Bulk Operations**: Batch multiple uploads when possible

## Troubleshooting

### Common Issues

1. **Upload Fails Silently**
   - Check environment variables
   - Verify R2 bucket permissions
   - Check network connectivity

2. **Images Not Loading**
   - Verify public URL configuration
   - Check custom domain settings
   - Confirm bucket public access

3. **Slow Upload Times**
   - Check file sizes
   - Verify network connection
   - Monitor Cloudflare status

4. **Permission Errors**
   - Verify R2 API token permissions
   - Check user authentication
   - Confirm bucket access rights

### Debug Mode

Enable detailed logging by setting:

```bash
NODE_ENV=development
DEBUG=cloudflare:*
```

## Integration Examples

### Deal Submission Form

```typescript
function DealSubmissionForm() {
  const [iconUrl, setIconUrl] = useState('');
  const { uploadImage } = useAppIconUpload();

  const handleIconUpload = async (file: File) => {
    try {
      const result = await uploadImage(file);
      setIconUrl(result.url);
    } catch (error) {
      console.error('Icon upload failed:', error);
    }
  };

  return (
    <form>
      <AppIconUpload 
        onUpload={setIconUrl}
        currentIcon={iconUrl}
        appName="Your App"
      />
      {/* ... other form fields */}
    </form>
  );
}
```

### User Profile Editor

```typescript
function ProfileEditor() {
  const [avatarUrl, setAvatarUrl] = useState('');
  const { uploadImage } = useProfileImageUpload();

  return (
    <ImageUpload
      onUpload={setAvatarUrl}
      currentImage={avatarUrl}
      folder="profile-images"
      maxSize={1024 * 1024}
      label="Profile Picture"
    />
  );
}
```

## Migration and Backup

### Data Migration

When migrating from other storage providers:

1. Export existing image URLs
2. Download images programmatically
3. Re-upload to Cloudflare R2
4. Update database references
5. Test all image loading

### Backup Strategy

1. **Regular Exports**: Automated R2 bucket sync
2. **Database Backup**: Include image URL references
3. **Disaster Recovery**: Multi-region replication
4. **Version Control**: Track image changes over time