/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
})

const nextConfig = {
    reactStrictMode: true,
    
    // 保持 5 分钟超时，这对连接 Notion 很重要
    staticPageGenerationTimeout: 300,

    // ⚠️ 删除了 experimental 的 CPU 限制，回归默认并发
    // Cloudflare 环境下有时候限制太死反而会崩溃

    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        })
        return config
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        // 允许的域名列表保持不变
        domains: ['001.blogimage.top', 'x1file.top', '003.blogimage.top', '004.blogimage.top', '005.blogimage.top', 'qpic.ws', 'upload.cc', 'x1image.top', 'www.imgccc.com', 'static.anzifan.com', 'cdn.sspai.com', 'cdn.dribbble.com', 'image.freepik.com', 'avatars.githubusercontent.com', 'cdn.jsdelivr.net', 'images.unsplash.com',
                 'img.notionusercontent.com',
                'gravatar.com',
                'www.notion.so',
                'source.unsplash.com',
                'p1.qhimg.com',
                'webmention.io',
                'ko-fi.com',
                'e.hiphotos.baidu.com',
                'fuss10.elemecdn.com',
                'file.notion.so'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.amazonaws.com',
            },
        ],
        // 保持禁用优化，这是解决 VipsJpeg 问题的关键
        unoptimized: true, 
    },
    output: 'export', 
    trailingSlash: true, 
}

module.exports = withPWA(nextConfig);
