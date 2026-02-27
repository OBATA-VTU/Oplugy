
export const uploadToImgBB = async (file: File | string): Promise<string> => {
  const apiKey = process.env.REACT_APP_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('ImgBB API key is missing. Please configure REACT_APP_IMGBB_API_KEY.');
  }

  const formData = new FormData();
  // ImgBB accepts binary file or base64 string (without the data:image/xxx;base64, prefix)
  if (typeof file === 'string') {
    const base64Data = file.split(',')[1] || file;
    formData.append('image', base64Data);
  } else {
    formData.append('image', file);
  }

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (data.success) {
    return data.data.url;
  } else {
    throw new Error(data.error?.message || 'Failed to upload image to ImgBB');
  }
};

export const imgbbService = {
  uploadImage: async (file: File | string) => {
    try {
      const url = await uploadToImgBB(file);
      return { status: true, data: url };
    } catch (error: any) {
      return { status: false, message: error.message };
    }
  }
};
