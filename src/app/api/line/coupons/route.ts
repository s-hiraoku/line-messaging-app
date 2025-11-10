import { NextResponse } from "next/server";

// Shared Coupon type definition
export interface Coupon {
  couponId: string;
  name: string;
  expirationDate?: string;
  used?: boolean;
}

// Mock coupon data - in real implementation, this would fetch from LINE API
export async function GET() {
  try {
    // TODO: Implement actual LINE Messaging API call to fetch coupons
    // const coupons = await lineClient.getCoupons();

    // For now, return mock data
    const coupons = [
      {
        couponId: "COUPON001",
        name: "新規登録クーポン 500円OFF",
        expirationDate: "2025-12-31",
        used: false,
      },
      {
        couponId: "COUPON002",
        name: "リピーター特典 10%OFF",
        expirationDate: "2025-06-30",
        used: false,
      },
      {
        couponId: "COUPON003",
        name: "期間限定クーポン 送料無料",
        expirationDate: "2025-03-31",
        used: true,
      },
    ];

    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}
