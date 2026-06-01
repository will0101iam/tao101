import { RefObject, useEffect, useState } from "react";

export function useSyncedAdminListHeight(
  listRef: RefObject<HTMLElement | null>,
  editorRef: RefObject<HTMLElement | null>,
  deps: readonly unknown[],
) {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frameId = 0;

    const updateHeight = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        if (window.innerWidth < 1024 || !listRef.current || !editorRef.current) {
          setHeight(null);
          return;
        }

        const listTop = listRef.current.getBoundingClientRect().top + window.scrollY;
        const editorBottom = editorRef.current.getBoundingClientRect().bottom + window.scrollY;
        const nextHeight = Math.max(320, Math.round(editorBottom - listTop));

        setHeight((current) => (current === nextHeight ? current : nextHeight));
      });
    };

    updateHeight();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateHeight) : null;

    if (resizeObserver && editorRef.current) {
      resizeObserver.observe(editorRef.current);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [editorRef, listRef, ...deps]);

  return height;
}
