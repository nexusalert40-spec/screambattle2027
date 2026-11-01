// Fill these in to enable Google Tag Manager / Google Analytics 4. Empty = nothing loads.
export const GTM_ID = ""; // e.g. "GTM-XXXXXXX"
export const GA4_ID = ""; // e.g. "G-XXXXXXXXXX"

export function trackingScripts() {
  const s: { src?: string; async?: boolean; children?: string }[] = [];
  if (GTM_ID) {
    s.push({
      children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
    });
  }
  if (GA4_ID) {
    s.push({ src: `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`, async: true });
    s.push({
      children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');`,
    });
  }
  return s;
}
