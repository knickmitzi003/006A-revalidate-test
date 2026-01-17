import { ProfileWidget } from '../widget/ProfileWidget'
import { StatsWidget } from '../widget/StatsWidget'

export const WidgetCollection = ({
  widgets,
}: {
  widgets: { [key: string]: any }
}) => {
  return (
    <div
      className="mb-6 grid grid-cols-2 gap-4 md:gap-8 lg:gap-10"
      data-aos="fade-up"
    >
      {/* 左侧：Profile 组件 */}
      <ProfileWidget data={widgets.profile} />
      
      {/* 右侧：公告板 (原 StatsWidget) */}
      {/* 
         只要你在 Notion 数据库中有一篇文章：
         Type = Widget
         Slug = announcement
         Status = Published
         它就会自动出现在 widgets 对象中
      */}
      <StatsWidget data={widgets.announcement} />
    </div>
  )
}
