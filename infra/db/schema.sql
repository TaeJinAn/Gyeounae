CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  auth_provider VARCHAR(40) NULL,
  provider_user_id VARCHAR(120) NULL,
  terms_accepted_at DATETIME NULL,
  privacy_accepted_at DATETIME NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  verified_at DATETIME NULL,
  suspended_until DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_users_status (status),
  INDEX idx_users_role (role),
  INDEX idx_users_provider (auth_provider, provider_user_id)
);

CREATE TABLE foot_profiles (
  user_id CHAR(36) PRIMARY KEY,
  foot_length_mm INT NULL,
  foot_width_mm INT NULL,
  foot_height_mm INT NULL,
  INDEX idx_foot_profile_user (user_id)
);

CREATE TABLE brands (
  id CHAR(36) PRIMARY KEY,
  name_ko VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NULL,
  scope_sport VARCHAR(20) NOT NULL,
  scope_item_type VARCHAR(40) NULL,
  source VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uniq_brand_scope (name_ko, scope_sport, scope_item_type, source),
  INDEX idx_brand_scope (scope_sport, scope_item_type),
  INDEX idx_brand_source (source)
);

CREATE TABLE items (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  sport VARCHAR(20) NOT NULL,
  item_type VARCHAR(40) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  brand_id CHAR(36) NOT NULL,
  size_type VARCHAR(40) NOT NULL,
  size_value VARCHAR(40) NOT NULL,
  price INT NOT NULL,
  region VARCHAR(60) NOT NULL,
  trade_method VARCHAR(40) NOT NULL,
  `condition` VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  is_sold TINYINT(1) NOT NULL DEFAULT 0,
  is_hidden TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at DATETIME NULL,
  owner_user_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_items_sport (sport),
  INDEX idx_items_item_type (item_type),
  INDEX idx_items_gender (gender),
  INDEX idx_items_brand (brand_id),
  INDEX idx_items_size (size_type, size_value),
  INDEX idx_items_price (price),
  INDEX idx_items_region (region),
  INDEX idx_items_trade_method (trade_method),
  INDEX idx_items_visibility (is_hidden, deleted_at),
  INDEX idx_items_status (status),
  INDEX idx_items_created (created_at)
);

CREATE TABLE item_images (
  id CHAR(36) PRIMARY KEY,
  item_id CHAR(36) NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL,
  INDEX idx_item_images_item (item_id)
);

CREATE TABLE events (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  item_id CHAR(36) NOT NULL,
  event_type VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_events_item (item_id),
  INDEX idx_events_user (user_id),
  INDEX idx_events_item_type (item_id, event_type),
  INDEX idx_events_created (created_at)
);

CREATE TABLE reports (
  id CHAR(36) PRIMARY KEY,
  reporter_user_id CHAR(36) NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id CHAR(36) NOT NULL,
  reason_code VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_reports_status (status),
  INDEX idx_reports_created (created_at)
);

CREATE TABLE inquiries (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  category VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  admin_reply TEXT NULL,
  replied_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_inquiries_status (status),
  INDEX idx_inquiries_created (created_at)
);

CREATE TABLE comments (
  id CHAR(36) PRIMARY KEY,
  item_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  parent_id CHAR(36) NULL,
  body TEXT NOT NULL,
  is_hidden TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_comments_item (item_id),
  INDEX idx_comments_parent (parent_id),
  INDEX idx_comments_user (user_id),
  INDEX idx_comments_created (created_at),
  INDEX idx_comments_visibility (is_hidden, deleted_at)
);

CREATE TABLE comment_reports (
  id CHAR(36) PRIMARY KEY,
  comment_id CHAR(36) NOT NULL,
  reporter_user_id CHAR(36) NOT NULL,
  reason_code VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL,
  memo TEXT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uniq_comment_report (comment_id, reporter_user_id),
  INDEX idx_comment_reports_status (status),
  INDEX idx_comment_reports_created (created_at)
);

CREATE TABLE moderation_actions (
  id CHAR(36) PRIMARY KEY,
  admin_user_id CHAR(36) NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id CHAR(36) NOT NULL,
  action_type VARCHAR(40) NOT NULL,
  reason_code VARCHAR(40) NOT NULL,
  memo TEXT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_moderation_target (target_id),
  INDEX idx_moderation_created (created_at)
);

CREATE TABLE ad_slots (
  id CHAR(36) PRIMARY KEY,
  slot_key VARCHAR(40) NOT NULL,
  title VARCHAR(100) NOT NULL,
  UNIQUE KEY uniq_ad_slot_key (slot_key)
);

CREATE TABLE ad_campaigns (
  id CHAR(36) PRIMARY KEY,
  slot_id CHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  status VARCHAR(20) NOT NULL,
  targeting_json JSON NULL,
  INDEX idx_ads_slot (slot_id),
  INDEX idx_ads_status (status),
  INDEX idx_ads_schedule (start_at, end_at)
);

CREATE TABLE ad_creatives (
  id CHAR(36) PRIMARY KEY,
  campaign_id CHAR(36) NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  sort_order INT NOT NULL,
  INDEX idx_ad_creatives_campaign (campaign_id)
);
