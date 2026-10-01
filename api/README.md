# Amsterdam API setup

## Database

Back up the `amsterdam` database before changing it. For a new database, import the repository's `amsterdam.sql` in phpMyAdmin. For an existing database created from the older dump, import `api/migrations/001_erp_auth.sql`, `002_shipments.sql`, `003_store_settings.sql`, `004_home_catalog.sql`, `005_payment_proofs.sql`, `006_order_item_colors.sql`, `007_customer_delivery_confirmation.sql`, `008_customer_returns.sql`, and `009_return_proofs.sql` in that order, once each. Migration 001 keeps existing business data, disables the two sample `123456` accounts, and adds Google identity, order details, product archiving, purchasing, inventory movement, and audit tables. Later migrations add shipments, persistent settings, the Home catalog SKUs, private payment-proof storage, selected colors on order items, customer delivery confirmations, customer-owned refund/exchange requests, and return proof images. Migration 004 archives the two original sample products without deleting order history. If earlier migrations were already applied, only apply the later missing migrations.

The local defaults in `api/config.php` are MySQL at `127.0.0.1`, database `amsterdam`, user `root`, and an empty password. Configure `AMSTERDAM_DB_HOST`, `AMSTERDAM_DB_NAME`, `AMSTERDAM_DB_USER`, and `AMSTERDAM_DB_PASSWORD` in the PHP/Apache environment for other installations. Do not commit production credentials.

To grant an administrator role, register that person's account through the site, then run this in phpMyAdmin's SQL tab, replacing the email:

```sql
UPDATE users SET role = 'super_admin' WHERE email = 'admin@example.com';
```

## Password reset OTP

The **Lupa password?** flow sends a one-time 6-digit code to the email address or phone number already saved on the account. Codes are stored hashed, expire after 10 minutes, allow at most 5 verification attempts, and can only be used once. Requests are throttled per IP and account. Unknown accounts receive the same generic response to reduce account enumeration.

Apply `api/migrations/010_password_reset_codes.sql` to the `amsterdam` database before enabling password reset. Email delivery uses Resend; verify the sender domain and configure these variables in the PHP/Apache environment:

```text
RESEND_API_KEY
PASSWORD_RESET_FROM_EMAIL
```

SMS delivery uses Twilio. Configure these variables for SMS:

```text
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_FROM_NUMBER
```

Configure at least one delivery channel and restart Apache/PHP. Never put provider credentials in frontend code or commit them to the repository. Phone numbers are normalized to Indonesia's `+62` format for SMS delivery; keep each account's phone number current.

Set `VITE_API_BASE_URL` in `.env.local` to the Apache API URL, for example `http://localhost/amsterdam/api`. Add the frontend origin to the comma-separated `AMSTERDAM_FRONTEND_ORIGINS` PHP environment variable if it differs from the local defaults in `api/config.php`.

For a single-domain deployment, use `VITE_API_BASE_URL=/api` so every device calls the same hosted API instead of its own `localhost`. For a separate frontend and API domain, set `VITE_API_BASE_URL` to the public API URL and add the frontend domain to `AMSTERDAM_FRONTEND_ORIGINS`.

## InfinityFree deployment

The storefront must be built before uploading; do not upload the project source as the website root. Run `npm run build`, then upload the **contents** of `dist/` to InfinityFree's `/htdocs/`, keeping the generated `assets/` directory and all hashed image files. Upload the project's `.htaccess` to `/htdocs/.htaccess` and the PHP files from `api/` to `/htdocs/api/`. Keep the SQL migration files private/off the public web root.

Create one MySQL database in the InfinityFree control panel. Import `amsterdam.sql` for a new install, or apply every missing migration in order for an existing install, including `010_password_reset_codes.sql`. Then copy `api/config.local.example.php` to `api/config.local.php` on the host and fill in that database's host, database name, username, and password. Add the Resend and/or Twilio settings there if password-reset delivery is enabled. `api/config.local.php` is ignored by Git and must never be committed.

The production frontend uses same-origin `/api` by default. Verify deployment by opening `https://amsterdam.infinityfree.io/api/health.php`; it should return JSON with `"ok": true`, not the InfinityFree welcome page. Since API and frontend share the same origin and MySQL database, registered accounts and sessions work across devices. The live `amsterdam.infinityfree.io` domain currently serves the InfinityFree welcome page, which means the built files have not yet replaced the default `/htdocs` contents.

## Payment confirmation

Pending manual transfers are confirmed or rejected by an admin after checking the bank or e-wallet provider externally. Do not confirm from the customer's selected payment method alone. Successful confirmation is audited and moves a pending order into processing. For automatic provider events, configure `PAYMENT_WEBHOOK_SECRET` on the PHP server and POST the raw JSON body `{"paymentId":123,"status":"success"}` or `{"paymentId":123,"status":"failed"}` to `payment-webhook.php` with `X-Payment-Signature` set to the lowercase hex HMAC-SHA256 of that exact raw body using the shared secret. The endpoint rejects missing or invalid signatures. Adapt the provider's native webhook into this contract on a trusted server; never expose the secret in the browser.

For non-COD checkout, customers must upload a JPG, PNG, or WebP payment proof up to 5 MB. The API validates the image and stores it in the `payments` table. `payment-proof.php` streams the image only to authenticated administrators. Apply migration `005_payment_proofs.sql` to existing databases before accepting orders with payment proof.

COD is not manually confirmed from the payment screen. When an admin records the package as shipped, the application creates the internal courier label `Kurir toko (COD)` and reference `AMS-COD-xxxxxx`; this reference is not a carrier tracking number. Payment remains pending until the admin marks the package received, which completes the order and confirms COD in the payment ledger. Connect a courier API to issue real tracking numbers if parcel tracking is needed.

## Current persisted workflows

Registration, password sign-in, email/SMS OTP password recovery, product/category/user management, checkout, payment confirmation, order status, shipping, inventory adjustment, returns, settings, customer/CRM views, analytics, and finance reports use MySQL. Checkout recalculates prices, validates coupons, locks stock, and writes the order, payment, and stock movement in one transaction. Admin changes are validated and audited; payment webhooks require an HMAC signature. Supplier and purchase-order tables are ready, but their receiving/purchase workflows and provider-specific payment adapters still need implementation before the ERP is complete end to end.