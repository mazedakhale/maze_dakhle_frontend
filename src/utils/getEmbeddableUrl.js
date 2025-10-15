const getEmbeddableUrl = (url) => {
    if (!url) return '';

    // ✅ If it's already a Google Drive preview URL, use it as is
    if (url.includes('/preview')) {
      return url;
    }

    // ✅ If it's a Google Drive view URL, convert to preview URL
    if (url.includes('drive.google.com/file/d/')) {
      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }

    // ✅ If it's a Google Drive usercontent URL, convert to preview URL
    if (url.includes('drive.google.com/uc')) {
      const fileIdMatch = url.match(/id=([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }

    // ✅ For local URLs, return as is
    return url;
  };


  export default getEmbeddableUrl;