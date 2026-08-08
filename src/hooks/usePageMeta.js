import { useEffect } from 'react'

export default function usePageMeta(title, description) {
  useEffect(() => {
    // Title
    document.title = title
      ? `${title} | TeachMe Ghana`
      : 'TeachMe Ghana — Find Verified Home Tutors'

    // Description
    const desc = description || 'TeachMe connects verified, certificate-checked teachers with parents and learners across Ghana for home tuition and live online sessions.'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = desc

    // OG tags
    const og = { 'og:title': document.title, 'og:description': desc, 'og:type': 'website', 'og:site_name': 'TeachMe Ghana' }
    Object.entries(og).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.content = content
    })

    return () => { document.title = 'TeachMe Ghana — Find Verified Home Tutors' }
  }, [title, description])
}