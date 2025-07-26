interface PresignedUploadResponse {
  uploadUrl: string;
  imageUrl: string;
  key: string;
  contentType: string;
}

export async function uploadImageToS3(file: File): Promise<string> {
  try {
    console.log('Starting image upload for file:', file.name, file.type, file.size);
    
    // Step 1: Get presigned URL from backend
    const backendUrl = process.env.NEXT_PUBLIC_RAG_BACKEND_URL || process.env.RAG_BACKEND_URL || 'http://localhost:8080';
    const apiKey = process.env.NEXT_PUBLIC_RAG_API_KEY || process.env.RAG_API_KEY || 'memoriva-api-key-2025';
    
    const response = await fetch(`${backendUrl}/api/upload/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        contentType: file.type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get presigned URL');
    }

    const data: PresignedUploadResponse = await response.json();
    console.log('Got presigned URL response:', data);

    // Step 2: Upload file directly to S3 using presigned URL with XMLHttpRequest for better CORS handling
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      console.log('Attempting upload to:', data.uploadUrl);
      xhr.open('PUT', data.uploadUrl, true);
      
      // Don't set Content-Type header manually - let the browser set it
      // xhr.setRequestHeader('Content-Type', file.type);
      
      xhr.onload = function() {
        console.log('Upload completed with status:', xhr.status, xhr.statusText);
        if (xhr.status === 200 || xhr.status === 204) {
          console.log('Upload successful, returning image URL:', data.imageUrl);
          resolve(data.imageUrl);
        } else {
          console.error('Upload failed:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
            responseHeaders: xhr.getAllResponseHeaders()
          });
          reject(new Error(`Upload failed with status: ${xhr.status} - ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = function() {
        console.error('Network error during upload. XHR details:', {
          readyState: xhr.readyState,
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText
        });
        reject(new Error('Upload failed due to network error'));
      };
      
      xhr.ontimeout = function() {
        console.error('Upload timeout');
        reject(new Error('Upload timed out'));
      };
      
      xhr.timeout = 30000; // 30 second timeout
      
      console.log('Sending file to S3...');
      xhr.send(file);
    });
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
