# Price Evidence Review

## Deployment order

1. In the Supabase SQL Editor, run `supabase/migrations/20261003_price_evidence_review.sql`.
2. Create a dedicated Supabase Auth reviewer account. Set its **app_metadata** `pricing_admin` to boolean `true` using a trusted server/Admin API. Never use user_metadata for authorization, and never put a service-role key in the frontend.
3. Test the RPCs on the project's staging database before enabling database-backed review in production.
4. Open the existing admin page, sign in to the reviewer account in the transaction section, and review each candidate. The URL key is not authorization to approve prices.

Before the migration, records safely fall back to model estimates. If the report RPC is missing, the frontend uses the existing insert endpoint to collect reports. Missing review fields prevent those reports from entering public prices. Database duplicate enforcement and review remain unavailable until the migration is applied; local duplicate protection still runs.

## Review criteria

- Reports require actual completed-sale evidence, not an asking price or a seller's claim of interest.
- Listings stay separate and are never labelled confirmed sales. Verify the listing is still available and record the evidence URL/date.
- Verify exact model and capacity. Mac requires CPU, GPU, RAM, SSD; iPad requires connectivity; Watch requires size, material, connectivity; AirPods requires generation and case.
- Baseline prices include normal, unrepaired products only. Damaged/repaired reports remain stored, but are excluded from this baseline. A future condition-specific price needs its own independent sample pool.
- Use a consistent opaque reviewer-assigned source code for each person/seller. Do not enter real names, phone numbers or personal data. The database hashes this code.
- Review notes should include specification and evidence provenance. Existing records default to pending; they must never be auto-approved.

## Calculation

- Separate sales and listings; no 6:1 weighting or blending.
- At least five reviewed independent sources in the preceding 90-day publication window. Each source contributes only its most recent matching observation to the snapshot.
- Median is the central price. P10/P90 is the observed sample interval, not a guaranteed selling range.
- Candidate outliers use median absolute deviation with a conservative minimum tolerance, not the old estimate +/-30%. Outliers remain stored for review; they are not deleted.
- Publish every Monday at 00:00 Asia/Taipei. Both submission and approval must be at least seven days old at that batch time. The window is fixed for the week.
- Evidence without sufficient samples falls back to a clearly labelled low-confidence model estimate. Missing/expired new-price limits are disclosed, not replaced with invented retail prices.
- Mac upgraded configurations remain model estimates unless evidence matches that exact configuration. A base-spec history must not be shown as upgraded-spec transaction history.
- NT$100 rounding remains. A genuinely identical sample distribution can have equal quantiles; never invent extra spread to make it look realistic.

## Safety and limitations

Device/account duplicate reports are rejected for 30 days using a database transaction lock. Anonymous browser IDs can be reset; they are not proof of human identity. The separate reviewer-assigned source key and required verification prevent anonymous submissions from automatically controlling public prices.

Approval and exclusion require authenticated `app_metadata.pricing_admin`; exclusion keeps the original row. Existing insert/update RLS policies must also be audited in the target database. This migration does not grant anonymous approval privileges or rewrite existing RLS policies.

The SQL file is provided but has not been executed or integration-tested against the production database. Model reference tables are unchanged; market calibration and fresh retail-source collection are separate evidence-gathering work.

## Checks

`node scripts/test-market-evidence.mjs`

`npm run validate:pricing`

`RAYON_NUM_THREADS=2 npm run build`

`git diff --check`
