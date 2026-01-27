import { NextResponse } from "next/server";
import { mariaDbPool } from "@infra/db/mariaDbPool";
import { categoriesBySport } from "@domain/value-objects/ListingCategory";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const brandSeeds = [
  { nameKo: "아토믹", nameEn: "Atomic", scopeSport: "ski" },
  { nameKo: "살로몬", nameEn: "Salomon", scopeSport: "ski" },
  { nameKo: "로시뇰", nameEn: "Rossignol", scopeSport: "ski" },
  { nameKo: "헤드", nameEn: "Head", scopeSport: "ski" },
  { nameKo: "노르디카", nameEn: "Nordica", scopeSport: "ski" },
  { nameKo: "피셔", nameEn: "Fischer", scopeSport: "ski" },
  { nameKo: "블리자드", nameEn: "Blizzard", scopeSport: "ski" },
  { nameKo: "다이나스타", nameEn: "Dynastar", scopeSport: "ski" },
  { nameKo: "뵐클", nameEn: "Volkl", scopeSport: "ski" },
  { nameKo: "엘란", nameEn: "Elan", scopeSport: "ski" },
  { nameKo: "테크니카", nameEn: "Tecnica", scopeSport: "ski" },
  { nameKo: "랑게", nameEn: "Lange", scopeSport: "ski" },
  { nameKo: "달벨로", nameEn: "Dalbello", scopeSport: "ski" },
  { nameKo: "마커", nameEn: "Marker", scopeSport: "ski" },
  { nameKo: "룩", nameEn: "Look", scopeSport: "ski" },
  { nameKo: "티롤리아", nameEn: "Tyrolia", scopeSport: "ski" },
  { nameKo: "아르마다", nameEn: "Armada", scopeSport: "ski" },
  { nameKo: "라인", nameEn: "Line", scopeSport: "ski" },
  { nameKo: "블랙크로우즈", nameEn: "Black Crows", scopeSport: "ski" },
  { nameKo: "버튼", nameEn: "Burton", scopeSport: "snowboard" },
  { nameKo: "라이드", nameEn: "Ride", scopeSport: "snowboard" },
  { nameKo: "케이투", nameEn: "K2", scopeSport: "both" },
  { nameKo: "나이트로", nameEn: "Nitro", scopeSport: "snowboard" },
  { nameKo: "리브테크", nameEn: "Lib Tech", scopeSport: "snowboard" },
  { nameKo: "지누", nameEn: "GNU", scopeSport: "snowboard" },
  { nameKo: "존스", nameEn: "Jones", scopeSport: "snowboard" },
  { nameKo: "캐피타", nameEn: "Capita", scopeSport: "snowboard" },
  { nameKo: "유니온", nameEn: "Union", scopeSport: "snowboard" },
  { nameKo: "플로우", nameEn: "Flow", scopeSport: "snowboard" },
  { nameKo: "디씨", nameEn: "DC", scopeSport: "snowboard" },
  { nameKo: "써티투", nameEn: "ThirtyTwo", scopeSport: "snowboard" },
  { nameKo: "로마", nameEn: "Rome", scopeSport: "snowboard" },
  { nameKo: "예스", nameEn: "YES", scopeSport: "snowboard" },
  { nameKo: "아버", nameEn: "Arbor", scopeSport: "snowboard" },
  { nameKo: "니데커", nameEn: "Nidecker", scopeSport: "snowboard" },
  { nameKo: "피오씨", nameEn: "POC", scopeSport: "both" },
  { nameKo: "오클리", nameEn: "Oakley", scopeSport: "both" },
  { nameKo: "스미스", nameEn: "Smith", scopeSport: "both" },
  { nameKo: "지로", nameEn: "Giro", scopeSport: "both" },
  { nameKo: "레키", nameEn: "Leki", scopeSport: "both" },
  { nameKo: "스윅스", nameEn: "Swix", scopeSport: "both" },
  { nameKo: "스캇", nameEn: "Scott", scopeSport: "both" }
];

const genders = ["men", "women", "unisex"] as const;
const sizeTypes = ["mm", "cm", "us"] as const;
const regions = ["Seoul", "Busan", "Daegu", "Incheon", "Daejeon"];
const tradeMethods = ["meet", "parcel"] as const;
const conditions = ["new", "like-new", "good", "fair"] as const;
const skiPlateImageUrl = "/seed/ski-plate.jpg";

const buildSampleImages = (command: {
  sport: "ski" | "snowboard";
  itemType: string;
}) => {
  if (command.sport === "ski" && command.itemType === "plate") {
    return [skiPlateImageUrl, skiPlateImageUrl, skiPlateImageUrl];
  }
  return [
    "https://via.placeholder.com/640x480.png?text=Item+1",
    "https://via.placeholder.com/640x480.png?text=Item+2",
    "https://via.placeholder.com/640x480.png?text=Item+3"
  ];
};

const buildSampleDescription = (command: {
  brand: string;
  sport: "ski" | "snowboard";
  itemType: string;
  condition: string;
  region: string;
  tradeMethod: string;
  sizeType: string;
  sizeValue: string;
  price: number;
}) => {
  const tradeLabel = command.tradeMethod === "meet" ? "직거래" : "택배";
  const sizeLabel = `${command.sizeType.toUpperCase()} ${command.sizeValue}`;
  const priceLabel = new Intl.NumberFormat("ko-KR").format(command.price);
  const usage =
    command.condition === "new"
      ? "미사용, 택도 그대로 있습니다."
      : command.condition === "like-new"
        ? "1~2회 사용, 스크래치 거의 없습니다."
        : command.condition === "good"
          ? "사용감 있으나 기능 문제 없습니다."
          : "사용감 많아 가격 반영했습니다.";
  const detailByType: Record<string, string> = {
    boots: "부츠 내부 쿠션 탄탄하고 냄새 거의 없습니다.",
    clothing: "의류 상태 깨끗하고 보풀 적습니다.",
    plate: "바인딩 포함, 조절 범위 넉넉합니다.",
    poles: "스트랩 상태 양호, 그립 마모 적습니다.",
    helmet: "패드 세척 완료, 충격 이력 없습니다.",
    accessories: "보관만 했고 구성품 빠짐 없습니다.",
    others: "정상 사용 가능합니다.",
    deck: "엣지 상태 양호하고 왁싱 완료했습니다."
  };
  const detail =
    detailByType[command.itemType] ?? "상태는 사진 참고 부탁드립니다.";
  return [
    `${command.brand} ${command.sport} ${command.itemType} 판매합니다.`,
    `사이즈 ${sizeLabel}, 희망가 ${priceLabel}원.`,
    usage,
    detail,
    `거래: ${tradeLabel} / 지역: ${command.region}.`,
    "빠른 거래 가능하신 분 우선입니다."
  ].join(" ");
};

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 404 });
  }

  const connection = await mariaDbPool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    const tables = [
      "ad_creatives",
      "ad_campaigns",
      "ad_slots",
      "item_images",
      "items",
      "brands",
      "foot_profiles",
      "events",
      "moderation_actions",
      "reports",
      "inquiries",
      "users"
    ];
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
    }
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    const adminId = crypto.randomUUID();
    const userOneId = crypto.randomUUID();
    const userTwoId = crypto.randomUUID();

    await connection.query(
      `
      INSERT INTO users (
        id, display_name, role, status, auth_provider, provider_user_id,
        terms_accepted_at, privacy_accepted_at, verified, verified_at, created_at
      ) VALUES
      (?, 'Admin User', 'ADMIN', 'active', 'seed', 'admin', NOW(), NOW(), 1, NOW(), NOW()),
      (?, 'Seller One', 'USER', 'active', 'seed', 'seller-one', NOW(), NOW(), 1, NOW(), NOW()),
      (?, 'Seller Two', 'USER', 'active', 'seed', 'seller-two', NOW(), NOW(), 0, NULL, NOW())
      `,
      [adminId, userOneId, userTwoId]
    );

    await connection.query(
      `
      INSERT INTO foot_profiles (user_id, foot_length_mm, foot_width_mm, foot_height_mm)
      VALUES
        (?, 265, 100, 60),
        (?, 270, 102, 62)
      `,
      [userOneId, userTwoId]
    );

    const brandIds: string[] = [];
    for (const brand of brandSeeds) {
      const id = crypto.randomUUID();
      brandIds.push(id);
      await connection.query(
        `
        INSERT INTO brands (
          id, name_ko, name_en, scope_sport, scope_item_type, source, created_at
        ) VALUES (?, ?, ?, ?, NULL, 'OFFICIAL', NOW())
        `,
        [id, brand.nameKo, brand.nameEn, brand.scopeSport]
      );
    }

    const itemIds: string[] = [];
    const itemMeta: Array<{ id: string; sport: "ski" | "snowboard"; itemType: string }> = [];
    const totalItems = 40;
    const skiItems = Math.floor(totalItems / 2);
    const snowboardItems = totalItems - skiItems;

    for (let i = 0; i < totalItems; i += 1) {
      const id = crypto.randomUUID();
      const isSki = i < skiItems;
      const sport: "ski" | "snowboard" = isSki ? "ski" : "snowboard";
      const sportIndex = isSki ? i : i - skiItems;
      const itemType =
        categoriesBySport[sport][sportIndex % categoriesBySport[sport].length];
      itemIds.push(id);
      itemMeta.push({ id, sport, itemType });
      const gender = genders[i % genders.length];
      const brandSeed = brandSeeds[i % brandSeeds.length];
      const brandId = brandIds[i % brandIds.length];
      const sizeType = itemType === "boots" ? "mm" : sizeTypes[i % sizeTypes.length];
      const sizeValue =
        sizeType === "mm"
          ? String(240 + (i % 10) * 5)
          : String(140 + (i % 10) * 2);
      const price = 80000 + (i % 10) * 15000;
      const region = regions[i % regions.length];
      const tradeMethod = tradeMethods[i % tradeMethods.length];
      const condition = conditions[i % conditions.length];
      const ownerUserId = i % 2 === 0 ? userOneId : userTwoId;
      const description = buildSampleDescription({
        brand: brandSeed.nameKo,
        sport,
        itemType,
        condition,
        region,
        tradeMethod,
        sizeType,
        sizeValue,
        price
      });

      await connection.query(
        `
        INSERT INTO items (
          id, title, description, sport, item_type, gender, brand_id,
          size_type, size_value, price, region, trade_method,
          \`condition\`, status, is_sold, is_hidden, deleted_at, owner_user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NULL, ?, NOW())
        `,
        [
          id,
          `${brandSeed.nameKo} ${sport} ${itemType}`,
          description,
          sport,
          itemType,
          gender,
          brandId,
          sizeType,
          sizeValue,
          price,
          region,
          tradeMethod,
          condition,
          "AVAILABLE",
          ownerUserId
        ]
      );
    }

    for (const meta of itemMeta) {
      const [first, second, third] = buildSampleImages({
        sport: meta.sport,
        itemType: meta.itemType
      });
      await connection.query(
        `
        INSERT INTO item_images (id, item_id, image_url, sort_order)
        VALUES
          (?, ?, ?, 1),
          (?, ?, ?, 2),
          (?, ?, ?, 3)
        `,
        [
          crypto.randomUUID(),
          meta.id,
          first,
          crypto.randomUUID(),
          meta.id,
          second,
          crypto.randomUUID(),
          meta.id,
          third
        ]
      );
    }

    for (let i = 0; i < itemMeta.length; i += 1) {
      const itemId = itemMeta[i].id;
      const eventCount = 3 + (i % 5);
      for (let j = 0; j < eventCount; j += 1) {
        const eventType = j % 3 === 0 ? "view" : j % 3 === 1 ? "favorite" : "contact";
        await connection.query(
          `
          INSERT INTO events (id, user_id, item_id, event_type, created_at)
          VALUES (?, ?, ?, ?, NOW())
          `,
          [
            crypto.randomUUID(),
            j % 2 === 0 ? userOneId : userTwoId,
            itemId,
            eventType
          ]
        );
      }
    }

    const slotIdMap: Record<string, string> = {
      HOME_TOP: crypto.randomUUID(),
      LIST_INLINE: crypto.randomUUID(),
      DETAIL_BOTTOM: crypto.randomUUID()
    };

    await connection.query(
      `
      INSERT INTO ad_slots (id, slot_key, title) VALUES
      (?, 'HOME_TOP', 'Home Top'),
      (?, 'LIST_INLINE', 'List Inline'),
      (?, 'DETAIL_BOTTOM', 'Detail Bottom')
      `,
      [slotIdMap.HOME_TOP, slotIdMap.LIST_INLINE, slotIdMap.DETAIL_BOTTOM]
    );

    const campaignOneId = crypto.randomUUID();
    const campaignTwoId = crypto.randomUUID();

    await connection.query(
      `
      INSERT INTO ad_campaigns (
        id, slot_id, title, start_at, end_at, status, targeting_json
      ) VALUES
      (?, ?, 'Winter Sale', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'RUNNING', JSON_OBJECT('sport', 'ski')),
      (?, ?, 'Board Deals', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'RUNNING', JSON_OBJECT('sport', 'snowboard'))
      `,
      [campaignOneId, slotIdMap.HOME_TOP, campaignTwoId, slotIdMap.LIST_INLINE]
    );

    await connection.query(
      `
      INSERT INTO ad_creatives (id, campaign_id, image_url, link_url, sort_order) VALUES
      (?, ?, ?, ?, 1),
      (?, ?, ?, ?, 2),
      (?, ?, ?, ?, 3),
      (?, ?, ?, ?, 1)
      `,
      [
        crypto.randomUUID(),
        campaignOneId,
        "https://via.placeholder.com/1200x400.png?text=Winter+Sale+1",
        "https://example.com",
        crypto.randomUUID(),
        campaignOneId,
        "https://via.placeholder.com/1200x400.png?text=Winter+Sale+2",
        "https://example.com",
        crypto.randomUUID(),
        campaignOneId,
        "https://via.placeholder.com/1200x400.png?text=Winter+Sale+3",
        "https://example.com",
        crypto.randomUUID(),
        campaignTwoId,
        "https://via.placeholder.com/1200x400.png?text=Board+Deals",
        "https://example.com"
      ]
    );

    await connection.commit();
    return NextResponse.json({
      ok: true,
      brands: brandSeeds.length,
      items: itemIds.length
    });
  } catch (error) {
    await connection.rollback();
    return NextResponse.json({ error: String(error) }, { status: 500 });
  } finally {
    connection.release();
  }
}
