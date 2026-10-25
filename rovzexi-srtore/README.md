# ROVZEXI

A French-first software catalog with MAD prices and direct WhatsApp enquiries.

## Run locally

```bash
npm install
npm run dev
```

Set `VITE_WHATSAPP_NUMBER` in `.env.local` to an international phone number without `+` or spaces. The provided example is the Moroccan number `0637296182` formatted for WhatsApp as `212637296182`.

## Demo features

- Browse and filter 15 software offers, view product details, search and sort the catalog.
- Each software detail page includes key features and a short getting-started guide. Product imagery is illustrative and displayed without third-party logos or overlays; ROVZEXI is the store's only brand.
- Displayed prices are in MAD. Product buttons open WhatsApp with the selected software and listed price in a prefilled message.
- No cart, online checkout, delivery, or payment flow. Customers confirm license type, duration, availability, final price, and device compatibility with the seller directly.
- Persistent product wishlist and demo admin product CRUD.
- French, English, and Arabic language selection; Arabic switches the document to RTL.

Product offers, prices, features, and license terms are illustrative until confirmed with the seller and software publisher. Usage guides describe general official-app workflows; they are not license activation instructions. A WhatsApp message is only prefilled; the customer chooses whether to send it. No license is issued automatically. Admin data is stored in browser `localStorage`, admin access has no authentication, and this demo is not suitable for production security or customer data.
