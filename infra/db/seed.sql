INSERT INTO users (
  id,
  display_name,
  role,
  status,
  auth_provider,
  provider_user_id,
  terms_accepted_at,
  privacy_accepted_at,
  verified,
  verified_at,
  created_at
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Admin User',
    'ADMIN',
    'active',
    'seed',
    'admin',
    NOW(),
    NOW(),
    1,
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Sample Seller',
    'USER',
    'active',
    'seed',
    'seller',
    NOW(),
    NOW(),
    1,
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Sample Buyer',
    'USER',
    'active',
    'seed',
    'buyer',
    NOW(),
    NOW(),
    0,
    NULL,
    NOW()
  );

INSERT INTO foot_profiles (
  user_id,
  foot_length_mm,
  foot_width_mm,
  foot_height_mm
) VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    265,
    100,
    60
  );

INSERT INTO brands (
  id,
  name_ko,
  name_en,
  scope_sport,
  scope_item_type,
  source,
  created_at
) VALUES
  ('b1111111-1111-1111-1111-111111111111', '아토믹', 'Atomic', 'ski', NULL, 'OFFICIAL', NOW()),
  ('b2222222-2222-2222-2222-222222222222', '살로몬', 'Salomon', 'ski', NULL, 'OFFICIAL', NOW()),
  ('b3333333-3333-3333-3333-333333333333', '로시뇰', 'Rossignol', 'ski', NULL, 'OFFICIAL', NOW()),
  ('b4444444-4444-4444-4444-444444444444', '헤드', 'Head', 'ski', NULL, 'OFFICIAL', NOW()),
  ('b5555555-5555-5555-5555-555555555555', '버튼', 'Burton', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('b6666666-6666-6666-6666-666666666666', '라이드', 'Ride', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('b7777777-7777-7777-7777-777777777777', '케이투', 'K2', 'both', NULL, 'OFFICIAL', NOW()),
  ('b8888888-8888-8888-8888-888888888888', '나이트로', 'Nitro', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('b9999999-9999-9999-9999-999999999999', '피오씨', 'POC', 'both', NULL, 'OFFICIAL', NOW()),
  ('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '오클리', 'Oakley', 'both', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000001', '노르디카', 'Nordica', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000002', '피셔', 'Fischer', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000003', '블리자드', 'Blizzard', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000004', '다이나스타', 'Dynastar', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000005', '뵐클', 'Volkl', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000006', '엘란', 'Elan', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000007', '테크니카', 'Tecnica', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000008', '랑게', 'Lange', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000009', '달벨로', 'Dalbello', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000010', '마커', 'Marker', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000011', '룩', 'Look', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000012', '티롤리아', 'Tyrolia', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000013', '레키', 'Leki', 'both', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000014', '스윅스', 'Swix', 'both', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000015', '스미스', 'Smith', 'both', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000016', '지로', 'Giro', 'both', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000017', '스캇', 'Scott', 'both', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000018', '아르마다', 'Armada', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000019', '라인', 'Line', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000020', '블랙크로우즈', 'Black Crows', 'ski', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000021', '리브테크', 'Lib Tech', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000022', '지누', 'GNU', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000023', '존스', 'Jones', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000024', '캐피타', 'Capita', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000025', '유니온', 'Union', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000026', '플로우', 'Flow', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000027', '디씨', 'DC', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000028', '써티투', 'ThirtyTwo', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000029', '로마', 'Rome', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000030', '예스', 'YES', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000031', '아버', 'Arbor', 'snowboard', NULL, 'OFFICIAL', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000032', '니데커', 'Nidecker', 'snowboard', NULL, 'OFFICIAL', NOW());

INSERT INTO items (
  id,
  title,
  description,
  sport,
  item_type,
  gender,
  brand_id,
  size_type,
  size_value,
  price,
  region,
  trade_method,
  `condition`,
  status,
  is_sold,
  is_hidden,
  deleted_at,
  owner_user_id,
  created_at
) VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'Atomic Redster Boots',
    '실사용 흔적이 적고 바닥 마모가 거의 없습니다. 빠른 판매 원합니다.',
    'ski',
    'boots',
    'men',
    'b1111111-1111-1111-1111-111111111111',
    'mm',
    '260',
    180000,
    'Seoul',
    'meet',
    'good',
    'AVAILABLE',
    0,
    0,
    NULL,
    '22222222-2222-2222-2222-222222222222',
    NOW()
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'Burton Custom Deck',
    '시즌 2회 사용, 보관 상태 양호. 직거래/택배 모두 가능합니다.',
    'snowboard',
    'deck',
    'unisex',
    'b5555555-5555-5555-5555-555555555555',
    'cm',
    '154',
    240000,
    'Busan',
    'parcel',
    'like-new',
    'AVAILABLE',
    0,
    0,
    NULL,
    '22222222-2222-2222-2222-222222222222',
    NOW()
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'POC Ski Jacket',
    '의류 상태 깨끗하고 보풀 적습니다. 택배 가능합니다.',
    'ski',
    'clothing',
    'women',
    'b9999999-9999-9999-9999-999999999999',
    'kr',
    '95',
    150000,
    'Incheon',
    'parcel',
    'good',
    'AVAILABLE',
    0,
    0,
    NULL,
    '22222222-2222-2222-2222-222222222222',
    NOW()
  );

INSERT INTO item_images (id, item_id, image_url, sort_order) VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'https://via.placeholder.com/640x480.png?text=Ski+Boots',
    1
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'https://via.placeholder.com/640x480.png?text=Snowboard+Deck',
    1
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'https://via.placeholder.com/640x480.png?text=Ski+Clothing',
    1
  );

INSERT INTO ad_slots (id, slot_key, title) VALUES
  ('s1111111-1111-1111-1111-111111111111', 'HOME_TOP', 'Home Top'),
  ('s2222222-2222-2222-2222-222222222222', 'LIST_INLINE', 'List Inline'),
  ('s3333333-3333-3333-3333-333333333333', 'DETAIL_BOTTOM', 'Detail Bottom');

INSERT INTO ad_campaigns (
  id,
  slot_id,
  title,
  start_at,
  end_at,
  status,
  targeting_json
) VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    's1111111-1111-1111-1111-111111111111',
    'Winter Sale',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    'RUNNING',
    JSON_OBJECT('sport', 'ski')
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    's2222222-2222-2222-2222-222222222222',
    'Board Deals',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    'RUNNING',
    JSON_OBJECT('sport', 'snowboard')
  );

INSERT INTO ad_creatives (id, campaign_id, image_url, link_url, sort_order) VALUES
  (
    'f1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    'https://via.placeholder.com/1200x400.png?text=Winter+Sale+1',
    'https://example.com',
    1
  ),
  (
    'f1111111-1111-1111-1111-111111111112',
    'e1111111-1111-1111-1111-111111111111',
    'https://via.placeholder.com/1200x400.png?text=Winter+Sale+2',
    'https://example.com',
    2
  ),
  (
    'f1111111-1111-1111-1111-111111111113',
    'e1111111-1111-1111-1111-111111111111',
    'https://via.placeholder.com/1200x400.png?text=Winter+Sale+3',
    'https://example.com',
    3
  ),
  (
    'f2222222-2222-2222-2222-222222222222',
    'e2222222-2222-2222-2222-222222222222',
    'https://via.placeholder.com/1200x400.png?text=Board+Deals',
    'https://example.com',
    1
  );
