interface LocalUploadResponse {
  imageUrl: string;
  filename: string;
}

export async function uploadImageLocally(file: File): Promise<string> {
  try {
    console.log('Starting local image upload for file:', file.name, file.type, file.size);
    
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('image', file);

    // Upload to local backend
    const response = await fetch('http://localhost:8080/api/upload/local', {
      method: 'POST',
      headers: {
        'X-API-Key': 'memoriva-api-key-2025',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data: LocalUploadResponse = await response.json();
    console.log('Upload successful:', data);
    
    return data.imageUrl;
  } catch (error) {
    console.error('Local image upload failed:', error);
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
