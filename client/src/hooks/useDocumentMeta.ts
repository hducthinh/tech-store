import { useEffect } from "react";

/**
 * Custom hook to dynamically update document title and meta description.
 * "Ponytail style": Using native browser APIs instead of a heavy library like react-helmet.
 */
export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    // Lưu lại title ban đầu để trả lại nếu component bị unmount (optional)
    const previousTitle = document.title;
    document.title = title ? `${title} | TechStore Pro` : "TechStore Pro Hardware";

    // Tìm thẻ meta description, nếu chưa có thì tạo mới
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }

    const previousDescription = metaDescription.getAttribute("content");
    metaDescription.setAttribute("content", description);

    // Cleanup khi component unmount
    return () => {
      document.title = previousTitle;
      if (previousDescription) {
        metaDescription?.setAttribute("content", previousDescription);
      }
    };
  }, [title, description]);
}
