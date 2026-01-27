# Implementation Plan (Audit + Roadmap)

## Feature Checklist
- Navigation
  - Top tabs: Ski / Snowboard
  - Category routes for ski and snowboard
  - Mobile-first chip filters
- Listings
  - Listing list + detail
  - Faceted filters from existing listings only
  - Empty states with gated CTA
- Auth + Terms
  - Kakao / Naver OAuth
  - Dev-only auth fallback (non-production)
  - Post-login terms acceptance gate
- Identity Verification Gate
  - Phone verification required before posting/contact
  - Verified flag persisted
- Foot Matching
  - Gaussian similarity for length/width/height
  - Overall + per-dimension score
- Ad Slots
  - Strict slot control: HOME_TOP / LIST_INLINE / DETAIL_BOTTOM
  - Campaigns with scheduling + status
- Recommendations
  - Content-based similarity + freshness + popularity
  - Event logging: view/favorite/contact/hide
  - Display as “Similar items” / “Users also viewed”
- Reports / Inquiries
  - Customer support inquiry tracking
  - Report review flow
- Admin
  - Listings moderation, users sanctions, reports, inquiries, ads
  - Role-based access control
- Logging
  - Moderation actions logged with actor/reason/time

## Target File / Folder Structure
- app/
  - (shop)/
  - (auth)/
  - (admin)/
- domain/
  - entities/
  - value-objects/
  - services/
- features/
  - usecases/
- repositories/
- infra/
  - db/
  - auth/
  - repositories/
- shared/
  - ui/
  - auth/
- docs/

## Planned DB Schema (Tables)
- users
  - auth_provider, auth_subject
  - terms_accepted_at, privacy_accepted_at
  - identity_status, role, status, foot profile
- listings
  - sport, category, gender, brand, size_label, price_amount, condition
  - visibility, status, seller_id
- ad_campaigns
  - slot_id, schedule, status
- recommendation_events
  - listing_id, user_id, event_type, created_at
- moderation_logs
  - actor_id, target_id, action_type, reason, reversible
- reports
  - reporter_id, target_type, target_id, status
- inquiries
  - user_id, subject, status

## Ordered Build Steps
1) Project structure + path aliases
2) Domain models + value objects
3) Repository interfaces + MariaDB repositories
4) Auth entry + OAuth + dev fallback
5) Terms acceptance flow
6) Listings list + faceted filters
7) Category pages + empty-state CTA
8) Identity verification gate
9) Foot matching domain logic + UI
10) Recommendations + event logging
11) Ad slots + campaign management
12) Reports + inquiries UI
13) Admin pages + role-based access
14) Moderation logging + audit trails
