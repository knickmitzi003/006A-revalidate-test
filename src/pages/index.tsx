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
    // 💡 多抓取一些，防止过滤掉草稿后数量不够
    const sum = LARGE + MEDIUM + SMALL + MORE + 10

    // 1. 获取所有文章
    const postsRaw = await getLimitPosts(sum, ApiScope.Home)
    let allFormattedPosts = await formatPosts(postsRaw)

    // =========================================================
    // 🛡️ 核心修复：只保留已发布 (Published) 的文章
    // =========================================================
    allFormattedPosts = allFormattedPosts.filter(
        post => post.status === 'Published' && post.type === 'Post'
    )

    // --- 原有逻辑：公告栏拦截 ---
    const announcementPost = allFormattedPosts.find(p => p.slug === 'announcement') || null

    // 过滤掉公告，不让它在普通列表中重复显示
    const filteredPosts = allFormattedPosts.filter(p => p.slug !== 'announcement')

    // 2. 获取统计数据和普通组件
    const blogStats = await getBlogStats()
    const rawWidgets = await getWidgets()
    const preFormattedWidgets = await preFormatWidgets(rawWidgets)
    const formattedWidgets = await formatWidgets(preFormattedWidgets, blogStats)

    // 数据防崩处理
    if (formattedWidgets && formattedWidgets.profile) {
        if (formattedWidgets.profile.links === undefined) {
            formattedWidgets.profile.links = null;
        }
    }

    // 注入公告
    ;(formattedWidgets as any).announcement = announcementPost

    return {
      props: {
        ...sharedPageStaticProps.props,
        // 返回过滤后的列表
        posts: filteredPosts.slice(0, sum - 10), 
        widgets: formattedWidgets || {},
      },
      revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
)

const withNavPage = withNavFooter(Home, undefined, true)

export default withNavPage
