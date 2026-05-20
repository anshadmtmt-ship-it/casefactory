# DNS Settings Guide for Email Deliverability

To ensure transactional emails from Case Factory land in user inboxes instead of spam folders, you must configure SPF, DKIM, and DMARC records on your custom domain DNS registrar.

---

## 1. SPF (Sender Policy Framework)
SPF defines which IP addresses or servers are authorized to send emails on behalf of your domain.

Add a **TXT** record at your domain root (`@`):

### If using Gmail/Google Workspace SMTP:
- **Type**: `TXT`
- **Host / Name**: `@` (or leave empty depending on DNS host)
- **Value / Content**: `v=spf1 include:_spf.google.com ~all`

### If using Resend:
- **Type**: `TXT`
- **Host / Name**: `@`
- **Value / Content**: `v=spf1 include:feedback.resend.com ~all`

### If using SendGrid:
- **Type**: `TXT`
- **Host / Name**: `@`
- **Value / Content**: `v=spf1 include:sendgrid.net ~all`

*Note: If you have multiple services sending mail, combine them into one record, e.g.:*  
`v=spf1 include:_spf.google.com include:feedback.resend.com ~all`

---

## 2. DKIM (DomainKeys Identified Mail)
DKIM adds a cryptographic signature to emails, verifying that the email was actually sent by the domain owner and not altered in transit.

### If using Gmail/Google Workspace:
1. Go to your **Google Admin Console** -> **Apps** -> **Google Workspace** -> **Gmail** -> **Authenticate email**.
2. Click **Generate New Record** (usually selector `google`).
3. Add the resulting **TXT** record to your DNS:
   - **Type**: `TXT`
   - **Host / Name**: `google._domainkey`
   - **Value / Content**: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...` (use the exact key generated)

### If using Resend or SendGrid:
1. Log into your provider dashboard and add your domain.
2. The platform will automatically generate **DKIM CNAME** records.
3. Typically, you will add 3 CNAME records:
   - Host: `resend._domainkey` or `s1._domainkey`
   - Pointing to: `dkim.resend.com` or `uXXXXX.s1.sendgrid.net`

---

## 3. DMARC (Domain-based Message Authentication, Reporting, and Conformance)
DMARC uses SPF and DKIM to determine the authenticity of an email message. It tells receiving mail servers what to do if validation fails.

Add a **TXT** record at the subdomain `_dmarc`:

- **Type**: `TXT`
- **Host / Name**: `_dmarc` (or `_dmarc.yourdomain.com`)
- **Value / Content**: `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@yourdomain.com`

### Parameters Explained:
- `p=quarantine`: Instructs mail servers to send failing emails to the Spam/Junk folder (can start with `p=none` for testing, then move to `p=quarantine`, and finally `p=reject` to completely block spoofing).
- `pct=100`: Applies the policy to 100% of emails.
- `rua=mailto:...`: Receives XML aggregate reports containing delivery statistics (replace with a real email account or remove if not desired).

---

## 4. Verification Check
After updating your DNS records:
1. Wait 5 to 15 minutes for propagation.
2. Verify setup using tools like [MxToolbox](https://mxtoolbox.com/) or by sending a test email and checking the headers (`Show original` in Gmail) to verify that `SPF: PASS`, `DKIM: PASS`, and `DMARC: PASS` are displayed.
