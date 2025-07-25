import React, { useMemo, useEffect, useRef } from 'react';

const activities = [
  {
    date: '2023年7月25日',
    title: '一个疯狂的想法诞生',
    description: '脑子里冒出一个疯狂的 app 想法。有点像为 Y 做的 X，但是加入了 Z。感觉这事有戏。#buildinpublic',
  },
  {
    date: '2023年7月24日',
    title: '不眠之夜，构建 MVP',
    description: '不眠之夜，咖啡为伴。MVP 终于初具雏形。虽然简陋，bug 不少，但它活过来了！#indiedev #startup',
  },
  {
    date: '2023年4月20日',
    title: '产品上线！',
    description: '终于上线了！经过几个月的奋战，我的小项目终于面世了。既紧张又兴奋。快来看看吧！#productlaunch',
  },
  {
    date: '2023年4月22日',
    title: '第一个付费用户！',
    description: '一个我完全不认识的人注册了。而且还付费了！这不是演习！你永远不会忘记第一个客户。#smallwins',
  },
  {
    date: '2023年6月5日',
    title: '用户突破1000！',
    description: '第 1000 个用户刚刚加入！社区在成长，反馈也非常棒。看起来路子走对了。#growth',
  },
  {
    date: '2023年7月1日',
    title: '艰难的决定：砍掉功能',
    description: '今天砍掉了一个我很喜欢的功能。艰难的决定，但数据不会说谎。最重要的是倾听用户的声音。#leanstartup',
  },
  {
    date: '2023年8月10日',
    title: '我们开始招人了！',
    description: '我们开始招人了！寻找一位创始工程师加入我们的使命。这不再是一个小团队，而是一艘火箭。请私信我。#hiring #startupjobs',
  },
  {
    date: '2023年9月15日',
    title: '来自 VC 的邮件',
    description: '收件箱里开始出现一些有趣的邮件，发件地址里带着‘.vc’。事情变得真实起来了。#venturecapital',
  },
  {
    date: '2025年7月24日',
    title: '融资路演',
    description: '向风投路演简直是份全职工作。你会听到99次‘不’，但你只需要一个‘是’。过程很磨人。#fundraising',
  },
  {
    date: '2025年7月25日',
    title: '完成种子轮融资！',
    description: '激动地宣布，我们完成了由 Awesome Ventures 领投的200万美元种子轮融资！这属于我们的团队、用户和所有从第一天就相信我们的人。现在，继续埋头苦干。#funding #startup',
  },
].reverse();

const parseDate = (dateStr: string): Date => {
  return new Date(dateStr.replace('年', '-').replace('月', '-').replace('日', ''));
};

const ActivityTab = ({ highlightDate }: { highlightDate?: string }) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const highlightIndex = useMemo(() => {
    if (!highlightDate) {
      return -1;
    }
    const targetDate = parseDate(highlightDate);
    if (isNaN(targetDate.getTime())) {
      return -1;
    }

    if (activities.length === 0) {
      return -1;
    }

    let closestIndex = -1;
    let minDiff = Infinity;

    activities.forEach((activity, index) => {
      const activityDate = parseDate(activity.date);
      const diff = Math.abs(targetDate.getTime() - activityDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, [highlightDate]);

  useEffect(() => {
    if (highlightIndex !== -1 && itemRefs.current[highlightIndex]) {
      itemRefs.current[highlightIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightIndex, highlightDate]);

  return (
    <div className="relative pl-8">
      <div className="absolute left-8 top-0 bottom-0 w-px bg-zinc-800"></div>
      <div className="space-y-12">
        {activities.map((activity, index) => (
          <div
            key={index}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={`relative transition-all duration-300 ${
              index === highlightIndex ? 'p-4 -ml-4 rounded-lg bg-zinc-900' : ''
            }`}
          >
            <div
              className={`absolute h-4 w-4 rounded-full border-4 border-zinc-950 transition-colors duration-300 ${
                index === highlightIndex ? '-left-10 top-5.5 bg-sky-500' : '-left-10 top-1.5 bg-zinc-700'
              }`}
            ></div>
            <p className="text-sm text-zinc-400">{activity.date}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{activity.title}</h3>
            <p className="mt-1 text-zinc-400">{activity.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTab;
