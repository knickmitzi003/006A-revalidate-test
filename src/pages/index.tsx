import CONFIG from '@/blog.config'
import { GetStaticProps, GetStaticPropsContext, NextPage } from 'next'
import ContainerLayout from '../components/post/ContainerLayout'
import { WidgetCollection } from '../components/section/WidgetCollection'
import withNavFooter from '../components/withNavFooter'
import { formatPosts } from '../lib/blog/format/post'
import { formatWidgets, preFormatWidgets } from '../lib/blog/format/widget'
import getBlogStats from '../lib/blog/getBlogStats'
import { withNavFooterStaticProps } from '../lib/blog/withNavFooterStaticProps'
import { getWidgets } from '../lib/notion/getBlogData'
import { getLimitPosts } from '../lib/notion/getDatabase'

import { MainPostsCollection } from '../components/section/MainPostsCollection'
import { MorePostsCollection } from '../components/section/MorePostsCollection'
import { Post, SharedNavFooterStaticProps } from '../types/blog'
import { ApiScope } from '../types/notion'

const Home: NextPage<{
  posts: Post[]
  widgets: {
    [key: string]: any
  }
}> = ({ posts, widgets }) => {
  return (
    <>
      <ContainerLayout>
        {/* WidgetCollection 会接收到我们注入的 announcement */}
        <WidgetCollection widgets={widgets} />
        <div data-aos="fade-up" data-aos-delay={300}>
          <MainPostsCollection posts={posts} />
        </div>
      </ContainerLayout>
      <MorePostsCollection posts={posts} />
    </>
  )
}

export const getStaticProps: GetStaticProps = withNavFooterStaticProps(
  async (
    _context: GetStaticPropsContext,
    sharedPageStaticProps: SharedNavFooterStaticProps
  ) => {
    const { LARGE, MEDIUM, SMALL, MORE } = CONFIG.HOME_POSTS_COUNT
    // 💡 关键：多抓取 5 篇，防止公告文章把首页填满导致普通文章不够
    const sum = LARGE + MEDIUM + SMALL + MORE + 5

    // 1. 获取所有文章 (Type = Post)
    const postsRaw = await getLimitPosts(sum, ApiScope.Home)
    const allFormattedPosts = await formatPosts(postsRaw)

    // --- 🔥 核心修复逻辑 ---
    
    // A. 拦截：找到 Slug 为 'announcement' 的文章
    const announcementPost = allFormattedPosts.find(p => p.slug === 'announcement') || null

    // B. 过滤：从主列表里剔除这篇公告 (防止它重复出现在下方的文章流里)
    const filteredPosts = allFormattedPosts.filter(p => p.slug !== 'announcement')

    // 2. 获取统计数据和普通组件
    const blogStats = await getBlogStats()
    const rawWidgets = await getWidgets()
    const preFormattedWidgets = await preFormatWidgets(rawWidgets)
    const formattedWidgets = await formatWidgets(preFormattedWidgets, blogStats)

    // 3. 注入：把拦截下来的公告塞给 widgets 对象
    ;(formattedWidgets as any).announcement = announcementPost

    return {
      props: {
        ...sharedPageStaticProps.props,
        // 这里返回过滤后的文章列表
        posts: filteredPosts.slice(0, sum - 5), 
        widgets: formattedWidgets,
      },
      // revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
)

const withNavPage = withNavFooter(Home, undefined, true)

export default withNavPage
