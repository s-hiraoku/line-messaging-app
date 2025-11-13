import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Imagemap Proxy API
 *
 * LINE imagemap API requires baseUrl to serve images with size suffixes:
 * - {baseUrl}/1040
 * - {baseUrl}/700
 * - {baseUrl}/460
 * - {baseUrl}/300
 *
 * This proxy converts those requests to Cloudinary URLs with appropriate transformations.
 *
 * Usage:
 * 1. Upload image to Cloudinary, get URL: https://res.cloudinary.com/.../image.jpg
 * 2. Use baseUrl: https://your-domain.com/api/imagemap-proxy/{cloudinary_public_id}
 * 3. LINE will request: https://your-domain.com/api/imagemap-proxy/{public_id}/1040
 * 4. This API redirects to: https://res.cloudinary.com/.../w_1040,h_1040,c_fill/image.jpg
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;

    if (!path || path.length === 0) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Extract size from last segment (e.g., /1040, /700, /460, /300)
    const lastSegment = path[path.length - 1];
    const size = parseInt(lastSegment);

    // Check if last segment is a valid size
    const validSizes = [1040, 700, 460, 300];
    let imageSize = 1040; // default
    let publicIdPath = path;

    if (validSizes.includes(size)) {
      imageSize = size;
      publicIdPath = path.slice(0, -1); // Remove size from path
    }

    if (publicIdPath.length === 0) {
      return NextResponse.json({ error: 'Missing image identifier' }, { status: 400 });
    }

    // Reconstruct public_id from path
    const publicId = publicIdPath.join('/');

    // Get Cloudinary cloud name from env
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    if (!CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
    }

    // Build Cloudinary URL with size transformation
    const cloudinaryUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${imageSize},h_${imageSize},c_fill/${publicId}`;

    // Redirect to Cloudinary URL
    return NextResponse.redirect(cloudinaryUrl, 302);
  } catch (error) {
    console.error('Imagemap proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
