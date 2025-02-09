import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

// Configuration
const prisma = new PrismaClient()
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});

interface CloudinaryUploadResult {
    public_id: string;
    bytes: number
    duration?: number
    [key: string]: any



}

export async function POST(request: NextRequest) {
    const { userId } = await auth()


    try {

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json({ error: 'Environment variables not set' }, { status: 500 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const originalSize = formData.get("originalSize") as string

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 400 })
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes)

        const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream(
                {
                    resource_type:'video',
                    folder: 'video-uploads',
                    transformation:[
                        {
                            quality:"auto",fetch_format:'mp4'
                        }
                    ]


                }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result as CloudinaryUploadResult);
                    }
                })
            upload_stream.end(buffer);
        });
       const video: any = await prisma.video.create({
        data: {
             title,
            description,
            publicId: uploadResult.public_id,
            originalSize: originalSize,
            compressedSize: uploadResult.bytes.toString(),
            duration: (uploadResult.duration || 0).toString(),
        }
       });
       return NextResponse.json(video);
    } catch (error) {
        console.log("upload image failed", error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

    }
    finally{
        await prisma.$disconnect()
    }
}