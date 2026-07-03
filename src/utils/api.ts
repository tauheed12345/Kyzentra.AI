/**
 * Submits form data directly to the Google Apps Script Web App.
 *
 * @param action - 'waitlist' | 'careers' | 'contact' | 'demo'
 * @param data   - Form payload object
 */
export const submitForm = async (action: string, data: any, _turnstileToken?: string) => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Use relative endpoint if in production, otherwise use the direct Apps Script URL for easy local testing
  const useRelative = import.meta.env.PROD || !isLocalhost;
  
  const url = useRelative 
    ? '/submit.php'
    : (import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbymnFnkMXj_VlErafiWLPt1uhghfXGG3gSFIA-hpTsyyQBLOp-6BuvX0KSb8aFFqJ8M/exec');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    body: JSON.stringify({ action, data, token: _turnstileToken || '' }),
  });

  if (!response.ok) {
    let errorMsg = 'Submission failed. Please try again.';
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errorMsg;
    } catch {
      try {
        const text = await response.text();
        if (text) {
          errorMsg = text.substring(0, 150);
        }
      } catch {}
    }
    throw new Error(errorMsg);
  }

  // Google Apps Script may redirect (302) and return the result as text.
  // Try to parse JSON; if it fails, assume success since no error was thrown.
  let result: { success: boolean; error?: string };
  try {
    result = await response.json();
  } catch {
    // If the response isn't valid JSON (e.g. opaque redirect), treat as success.
    // The data was sent — check your Google Sheet to confirm.
    return { success: true };
  }

  if (!result.success) {
    throw new Error(result.error || 'Submission failed. Please try again.');
  }

  return result;
};

/**
 * Helper to convert a file to a base64 encoded structure for Apps Script upload.
 */
export interface FileData {
  base64: string;
  name: string;
  mimeType: string;
}

export const fileToBase64 = (file: File): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve({
        base64,
        name: file.name,
        mimeType: file.type
      });
    };
    reader.onerror = (error) => reject(error);
  });
};
