import React, { useEffect, useRef } from 'react'

export default function Giscus() {
  const containerRef = useRef(null)

  useEffect(() => {
    const script = document.createElement('script')
    const giscusAttributes = {
      src: "https://giscus.app/client.js",
      "data-repo": "winterjung/blog",
      "data-repo-id": "MDEwOlJlcG9zaXRvcnkyMzYyNTc3MDc=",
      "data-category": "Comments",
      "data-category-id": "DIC_kwDODhUBq84Cj2FN",
      "data-mapping": "pathname",
      "data-strict": "0",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": "preferred_color_scheme",
      "data-lang": "ko",
      "data-loading": "lazy",
      crossorigin: "anonymous",
      async: true,
    }

    Object.entries(giscusAttributes).forEach(([key, value]) => {
      script.setAttribute(key, value)
    })
    
    containerRef.current.appendChild(script)
    return () => {
      containerRef.current?.removeChild(script)
    }
  }, [])

  return <div ref={containerRef} />
}
