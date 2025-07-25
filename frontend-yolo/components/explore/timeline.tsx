import React from 'react';
import CreatePost from '@/components/explore/create-post';
import { MessageCircle, Repeat2, Heart, BarChart2, MoreHorizontal, Upload, CheckCircle } from 'lucide-react';

const threads = [
  {
    id: 1,
    user: {
      name: 'Sidessh',
      handle: '@SidesshMore',
      avatar: 'https://pbs.twimg.com/profile_images/1792945839252848640/5gH7B2_N_400x400.jpg',
      verified: true,
    },
    content: "A year from now, you'll wish you had started today.",
    timestamp: '38m',
    stats: {
      comments: 8,
      retweets: 1,
      likes: 15,
      views: '757',
    }
  },
  {
    id: 2,
    user: {
      name: 'Saanvi',
      handle: '@Saaannvvii',
      avatar: 'https://pbs.twimg.com/profile_images/1753874351317524480/PahG9b2C_400x400.jpg',
      verified: true,
    },
    content: "You are crazy if you still write your own code.",
    timestamp: '7h',
    stats: {
      comments: 9,
      retweets: 0,
      likes: 12,
      views: '283',
    }
  },
    {
    id: 3,
    user: {
      name: 'Enod Bataa',
      handle: '@enod_bataa',
      avatar: 'https://pbs.twimg.com/profile_images/1632360588731351040/L6pI7fgx_400x400.jpg',
      verified: false,
    },
    content: "1/ Unpopular opinion: The best way to get results from AI isn't by being nice—it's by challenging it.",
    timestamp: '7h',
    stats: {
      comments: 9,
      retweets: 2,
      likes: 9,
      views: '485',
    }
  },
  {
    id: 4,
    user: {
      name: 'Urja Kohli',
      handle: '@urja_kohli',
      avatar: 'https://pbs.twimg.com/profile_images/1661599388692606976/Ak1GXaRE_400x400.jpg',
      verified: true,
    },
    content: "how many side projects made you some bucks?",
    timestamp: '7h',
    stats: {
      comments: 8,
      retweets: 1,
      likes: 13,
      views: '212',
    }
  },
   {
    id: 5,
    user: {
      name: 'Fede',
      handle: '@buildwithfede',
      avatar: 'https://pbs.twimg.com/profile_images/1699479393322541056/k1NTE4IF_400x400.jpg',
      verified: true,
    },
    content: "Still haven't met a single non-technical person launching a production-ready app.",
    timestamp: '1h',
    stats: {
      comments: 7,
      retweets: 0,
      likes: 12,
      views: '240',
    }
  },
  {
    id: 6,
    user: {
      name: 'Alex Ruber',
      handle: '@alex_ruber',
      avatar: 'https://pbs.twimg.com/profile_images/1664403332454653953/ER2pufp3_400x400.jpg',
      verified: true,
    },
    content: `day 145 of building candle, the duolingo for relationships

failed 7x this week, a few long format and short form failures, then hit again with long format

experimented with super long (60+ seconds) this time for tt. only 130k views so far but incredible conversion at ~8% view`,
    timestamp: '2h',
    stats: {
      comments: 12,
      retweets: 2,
      likes: 98,
      views: '130K',
    }
  },
  {
    id: 7,
    user: {
      name: 'Sidessh',
      handle: '@SidesshMore',
      avatar: 'https://pbs.twimg.com/profile_images/1792945839252848640/5gH7B2_N_400x400.jpg',
      verified: true,
    },
    content: "Another year from now, you'll wish you had started today.",
    timestamp: '1d',
    stats: {
      comments: 18,
      retweets: 11,
      likes: 115,
      views: '1.7k',
    }
  },
  {
    id: 8,
    user: {
      name: 'Saanvi',
      handle: '@Saaannvvii',
      avatar: 'https://pbs.twimg.com/profile_images/1753874351317524480/PahG9b2C_400x400.jpg',
      verified: true,
    },
    content: "You are not so crazy if you still write your own code.",
    timestamp: '1d',
    stats: {
      comments: 19,
      retweets: 1,
      likes: 22,
      views: '1.2k',
    }
  },
    {
    id: 9,
    user: {
      name: 'Enod Bataa',
      handle: '@enod_bataa',
      avatar: 'https://pbs.twimg.com/profile_images/1632360588731351040/L6pI7fgx_400x400.jpg',
      verified: false,
    },
    content: "2/ Unpopular opinion: The best way to get results from AI isn't by being nice—it's by challenging it.",
    timestamp: '1d',
    stats: {
      comments: 19,
      retweets: 12,
      likes: 19,
      views: '1.4k',
    }
  },
  {
    id: 10,
    user: {
      name: 'Urja Kohli',
      handle: '@urja_kohli',
      avatar: 'https://pbs.twimg.com/profile_images/1661599388692606976/Ak1GXaRE_400x400.jpg',
      verified: true,
    },
    content: "how many side projects made you some bucks? For real.",
    timestamp: '1d',
    stats: {
      comments: 18,
      retweets: 11,
      likes: 113,
      views: '1.2k',
    }
  },
   {
    id: 11,
    user: {
      name: 'Fede',
      handle: '@buildwithfede',
      avatar: 'https://pbs.twimg.com/profile_images/1699479393322541056/k1NTE4IF_400x400.jpg',
      verified: true,
    },
    content: "Still haven't met a single non-technical person launching a production-ready app. This is a copy.",
    timestamp: '2d',
    stats: {
      comments: 17,
      retweets: 10,
      likes: 112,
      views: '1.2k',
    }
  },
  {
    id: 12,
    user: {
      name: 'Alex Ruber',
      handle: '@alex_ruber',
      avatar: 'https://pbs.twimg.com/profile_images/1664403332454653953/ER2pufp3_400x400.jpg',
      verified: true,
    },
    content: `day 146 of building candle, the duolingo for relationships. Another copy`,
    timestamp: '2d',
    stats: {
      comments: 22,
      retweets: 12,
      likes: 198,
      views: '230K',
    }
  },
];

const StatIcon = ({ icon: Icon, count, colorClass }: { icon: React.ElementType, count: number, colorClass: string }) => (
    <div className={`flex items-center gap-1 text-gray-500 hover:${colorClass} transition-colors`}>
      <Icon size={16} />
      {count > 0 && <span className="text-xs">{count}</span>}
    </div>
)


const Timeline = () => {
  return (

    <div className="w-full max-w-2xl mx-auto text-white h-screen flex flex-col">
      <CreatePost />
      <div className="flex-1 overflow-y-auto">
        {threads.map(thread => (
          <div key={thread.id} className="flex gap-4 p-4 border-b border-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thread.user.avatar} alt={`${thread.user.name}'s avatar`} className="w-12 h-12 rounded-full" />
              <div className='w-full'>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                          <span className="font-bold hover:underline cursor-pointer">{thread.user.name}</span>
                          {thread.user.verified && <CheckCircle size={16} className="text-blue-500 fill-current" />}
                          <span className="text-gray-500">{thread.user.handle}</span>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-500 hover:underline cursor-pointer">{thread.timestamp}</span>
                      </div>
                      <div className="text-gray-500">
                          <MoreHorizontal size={18}/>
                      </div>
                  </div>
                  <p className='whitespace-pre-wrap'>{thread.content}</p>
                   <div className="flex items-center justify-between mt-4 max-w-sm">
                      <StatIcon icon={MessageCircle} count={thread.stats.comments} colorClass='text-blue-500'/>
                      <StatIcon icon={Repeat2} count={thread.stats.retweets} colorClass='text-green-500' />
                      <StatIcon icon={Heart} count={thread.stats.likes} colorClass='text-pink-500' />
                      <div className="flex items-center gap-1 text-gray-500">
                          <BarChart2 size={16} />
                          <span className="text-xs">{thread.stats.views}</span>
                      </div>
                      <div className="text-gray-500">
                        <Upload size={16} />
                      </div>
                  </div>
              </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline; 