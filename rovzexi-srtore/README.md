# ROVZEXI

A French-first software catalog with MAD prices and direct WhatsApp enquiries.

## Run locally

```bash
npm install
npm run dev
```

Set `VITE_WHATSAPP_NUMBER` in `.env.local` to an international phone number without `+` or spaces. The provided example is the Moroccan number `0637296182` formatted for WhatsApp as `212637296182`.

## Deploy to Vercel

1. Push this project to a GitHub repository and import that repository in Vercel.
2. If the repository contains the project in a subfolder, set the Vercel **Root Directory** to `rovzexi-srtore`.
3. Use `npm run build` as the build command and `dist` as the output directory. Vercel's Vite defaults also work.
4. Add `VITE_WHATSAPP_NUMBER` in the Vercel project environment variables (international digits only), then deploy.

The Vercel rewrite keeps client-side product and shop URLs working when opened directly or refreshed.

## Demo features

- Browse and filter 15 software offers, view product details, search and sort the catalog.
- Each software detail page includes key features and a short getting-started guide. Product imagery is illustrative and displayed without third-party logos or overlays; ROVZEXI is the store's only brand.
- Displayed prices are in MAD. Product buttons open WhatsApp with the selected software and listed price in a prefilled message.
- No cart, online checkout, delivery, or payment flow. Customers confirm license type, duration, availability, final price, and device compatibility with the seller directly.
- Persistent product wishlist and demo admin product CRUD.
- French, English, and Arabic language selection; Arabic switches the document to RTL.

Product offers, prices, features, and license terms are illustrative until confirmed with the seller and software publisher. Usage guides describe general official-app workflows; they are not license activation instructions. A WhatsApp message is only prefilled; the customer chooses whether to send it. No license is issued automatically. Admin data is stored in browser `localStorage`, admin access has no authentication, and this demo is not suitable for production security or customer data.
