import { PrismaClient, MessageType } from '@prisma/client'

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

  console.log('✅ Seeding completed successfully!')
  console.log(`Created:
  - ${tags.length} tags
  - ${templates.length} templates`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
