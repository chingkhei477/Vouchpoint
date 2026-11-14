# VOUCHPOINT — website

A static, ready-to-deploy cashback website. No build step, no server code, no admin dashboard.

## Structure

```
index.html              Home
offers.html             Offers (renders from assets/js/offers-data.js)
how-it-works.html       Full guide: eligibility, tracking, statuses, withdrawal, FAQ
about.html              About Us
contact.html            Contact details + contact form
cashback-policy.html    Cashback Policy
refund-policy.html      Refund Policy
privacy-policy.html     Privacy Policy
terms.html              Terms & Conditions
404.html                Not-found page
favicon.ico, site.webmanifest, robots.txt, sitemap.xml
assets/css/styles.css   All styles (design tokens at the top)
assets/js/main.js       Navigation, header, scroll reveal, back-to-top, policy contents
assets/js/offers-data.js  THE OFFER LIST — edit this to add offers
assets/js/offers.js     Offer card rendering, search, filter, sort
assets/js/contact.js    Contact form validation and sending
assets/img/             Logo, favicons, app icons, social-sharing image
```

## Deploy

Upload the whole folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, Hostinger, cPanel).
Put it at the root of **vouchpoint.in**. Canonical URLs, social-sharing tags and the sitemap use `https://vouchpoint.in`.
If you use a different domain, search and replace `https://vouchpoint.in` in all `.html` files, `robots.txt` and `sitemap.xml`.

To use the custom 404 page: Netlify and Cloudflare Pages pick up `404.html` automatically; on Apache add
`ErrorDocument 404 /404.html` to `.htaccess`.

## Adding offers

Open `assets/js/offers-data.js`, copy the commented template, and fill in the store, rate, terms and your tracked link.
Set `featured: true` to show an offer on the Home page. While the list is empty, the site shows a clear
"verified offers are on their way" notice instead of made-up deals. Optional store logos go in `assets/img/stores/`.

## Contact form

The site has no server, so the form checks the fields and then opens the visitor's email app with a pre-filled
message to support@vouchpoint.in. To receive messages without the email app, set `FORM_ENDPOINT` at the top of
`assets/js/contact.js` to a form service URL that accepts JSON POST requests (for example Formspree or Web3Forms).

## Business details used

- Email: support@vouchpoint.in
- Address: Tronglaobi Tidim Road, Manipur, India
- Withdrawals: UPI only, ₹100 minimum

These appear in the footer, Contact page, About page, policies and structured data. Missing-cashback claims: 7 days to
appear, 30 days to claim (Cashback Policy section 7). Change them there if your process differs.

## Brand

- Colours: Paper `#F4EFE6`, Ink `#16130F`, Vermilion `#E8452C`, Pine `#164B3E`, Saffron `#F3B23A`
- Type: Fraunces (headings), Instrument Sans (body), JetBrains Mono (labels), loaded from Google Fonts
- Mark: a voucher stub with a "V" whose stroke ends in a point
