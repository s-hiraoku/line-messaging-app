import { PrismaClient, MessageType, MatchType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // チャンネル設定の作成
  console.log('Creating channel config...')
  await prisma.channelConfig.upsert({
    where: { id: 'primary' },
    update: {},
    create: {
      id: 'primary',
      channelId: process.env.LINE_CHANNEL_ID,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
      basicId: process.env.LINE_BASIC_ID,
      friendUrl: process.env.LINE_FRIEND_URL,
    },
  })

  // タグの作成
  console.log('Creating tags...')
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: '新規顧客' },
      update: {},
      create: { name: '新規顧客', color: '#10b981' },
    }),
    prisma.tag.upsert({
      where: { name: 'VIP顧客' },
      update: {},
      create: { name: 'VIP顧客', color: '#f59e0b' },
    }),
    prisma.tag.upsert({
      where: { name: 'リピーター' },
      update: {},
      create: { name: 'リピーター', color: '#3b82f6' },
    }),
    prisma.tag.upsert({
      where: { name: '休眠顧客' },
      update: {},
      create: { name: '休眠顧客', color: '#6b7280' },
    }),
    prisma.tag.upsert({
      where: { name: 'キャンペーン対象' },
      update: {},
      create: { name: 'キャンペーン対象', color: '#ec4899' },
    }),
  ])

  // テンプレートの作成
  console.log('Creating templates...')
  const templates = await Promise.all([
    prisma.template.create({
      data: {
        name: '挨拶メッセージ',
        type: MessageType.TEXT,
        content: {
          type: 'text',
          text: 'こんにちは、{{name}}さん！いつもご利用ありがとうございます。',
        },
        variables: ['name'],
        category: '挨拶',
        isActive: true,
      },
    }),
    prisma.template.create({
      data: {
        name: 'キャンペーン告知',
        type: MessageType.TEXT,
        content: {
          type: 'text',
          text: '🎉 お得なキャンペーン開催中！\n期間限定で{{discount}}%OFF！\n詳細はこちら: {{url}}',
        },
        variables: ['discount', 'url'],
        category: 'プロモーション',
        isActive: true,
      },
    }),
    prisma.template.create({
      data: {
        name: '注文確認',
        type: MessageType.TEXT,
        content: {
          type: 'text',
          text: 'ご注文ありがとうございます！\n注文番号: {{orderNumber}}\n商品: {{productName}}\n金額: ¥{{amount}}',
        },
        variables: ['orderNumber', 'productName', 'amount'],
        category: '取引',
        isActive: true,
      },
    }),
    prisma.template.create({
      data: {
        name: 'リマインダー',
        type: MessageType.TEXT,
        content: {
          type: 'text',
          text: '📅 リマインド\n{{date}}の予約を忘れずに！\n場所: {{location}}',
        },
        variables: ['date', 'location'],
        category: 'リマインダー',
        isActive: true,
      },
    }),
  ])

  // デフォルト応答の作成
  console.log('Creating default auto-reply...')
  await prisma.defaultAutoReply.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      replyText: 'メッセージありがとうございます！担当者が確認次第、ご返信いたします。',
      isActive: false,
    },
  })

  // 自動応答ルールの作成
  console.log('Creating auto-reply rules...')
  const autoReplies = await Promise.all([
    prisma.autoReply.create({
      data: {
        name: '営業時間の問い合わせ',
        keywords: ['営業時間', '何時まで', '何時から', '営業日'],
        replyText: '営業時間は平日9:00-18:00、土曜日9:00-15:00です。日曜祝日は休業しております。',
        priority: 10,
        isActive: true,
        matchType: MatchType.CONTAINS,
      },
    }),
    prisma.autoReply.create({
      data: {
        name: 'アクセス情報',
        keywords: ['場所', 'アクセス', '住所', '行き方', '道順'],
        replyText: '東京都渋谷区〇〇1-2-3\n最寄り駅: 渋谷駅 徒歩5分\n地図: https://example.com/map',
        priority: 10,
        isActive: true,
        matchType: MatchType.CONTAINS,
      },
    }),
    prisma.autoReply.create({
      data: {
        name: '予約方法',
        keywords: ['予約', '予約したい', '予約方法', '予約可能'],
        replyText: 'ご予約はお電話またはWebサイトから承っております。\n電話: 03-1234-5678\nWeb: https://example.com/booking',
        priority: 20,
        isActive: true,
        matchType: MatchType.CONTAINS,
      },
    }),
    prisma.autoReply.create({
      data: {
        name: '料金・価格の問い合わせ',
        keywords: ['料金', '価格', '値段', 'いくら', '費用'],
        replyText: '料金につきましては、サービス内容により異なります。詳細は以下のページをご確認ください。\nhttps://example.com/pricing',
        priority: 20,
        isActive: true,
        matchType: MatchType.CONTAINS,
      },
    }),
    prisma.autoReply.create({
      data: {
        name: '挨拶への返答',
        keywords: ['こんにちは', 'こんばんは', 'おはよう'],
        replyText: 'こんにちは！お問い合わせありがとうございます。ご用件をお聞かせください。',
        priority: 50,
        isActive: true,
        matchType: MatchType.CONTAINS,
      },
    }),
    prisma.autoReply.create({
      data: {
        name: '感謝への返答',
        keywords: ['ありがとう'],
        replyText: 'どういたしまして！またのご利用をお待ちしております。',
        priority: 50,
        isActive: true,
        matchType: MatchType.CONTAINS,
      },
    }),
  ])

  console.log('✅ Seeding completed successfully!')
  console.log(`Created:
  - ${tags.length} tags
  - ${templates.length} templates
  - ${autoReplies.length} auto-reply rules
  - 1 default auto-reply`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
