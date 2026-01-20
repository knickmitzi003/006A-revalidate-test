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
    
    // 超时时间：给足 5 分钟
    staticPageGenerationTimeout: 300,

    experimental: {
        appDir: false, // 必须为 false
        workerThreads: false,
        cpus: 1, 
    },

    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        })
        return config
    },

    images: {
        formats: ['image/avif', 'image/webp'],
        domains: [
            'www.notion.so',
            'images.unsplash.com',
            'img.notionusercontent.com',
            'file.notion.so',
            'static.anzifan.com'
        ],
        unoptimized: true,
    },
    // Vercel 建议开启
    trailingSlash: true,
}

module.exports = withPWA(nextConfig);