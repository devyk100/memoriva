interface UploadResponse {
  imageUrl: string;
}

export async function uploadImageToS3(file: File): Promise<string> {
  try {
    console.log('Starting image upload for file:', file.name, file.type, file.size);
    
    // Upload file through backend (backend handles S3 upload)
    const backendUrl = process.env.NEXT_PUBLIC_RAG_BACKEND_URL || process.env.RAG_BACKEND_URL || 'http://localhost:8080';
    const apiKey = process.env.NEXT_PUBLIC_RAG_API_KEY || process.env.RAG_API_KEY || 'memoriva-api-key-2025';
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${backendUrl}/api/upload/s3`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data: UploadResponse = await response.json();
    console.log('Upload successful, returning image URL:', data.imageUrl);
    
    return data.imageUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

export function getImageFromClipboard(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      return item.getAsFile();
    }
  }
  return null;
}
