import React from 'react';
import CreatePost from '@/components/explore/create-post';
import { MoreHorizontal, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const threads = [
  {
    id: 1,
    user: {
      name: 'Sidessh',
      handle: '@SidesshMore',
      avatar: 'https://pbs.twimg.com/profile_images/1792945839252848640/5gH7B2_N_400x400.jpg',
      verified: true,
      yoloStockValue: 12345,
    },
    content: "A year from now, you'll wish you had started today.",
    timestamp: '38m',
  },
  {
    id: 2,
    user: {
      name: 'Saanvi',
      handle: '@Saaannvvii',
      avatar: 'https://pbs.twimg.com/profile_images/1753874351317524480/PahG9b2C_400x400.jpg',
      verified: true,
      yoloStockValue: 54321,
    },
    content: "You are crazy if you still write your own code.",
    timestamp: '7h',
  },
    {
    id: 3,
    user: {
      name: 'Enod Bataa',
      handle: '@enod_bataa',
      avatar: 'https://pbs.twimg.com/profile_images/1632360588731351040/L6pI7fgx_400x400.jpg',
      verified: false,
      yoloStockValue: 67890,
    },
    content: "1/ Unpopular opinion: The best way to get results from AI isn't by being nice—it's by challenging it.",
    timestamp: '7h',
  },
  {
    id: 4,
    user: {
      name: 'Urja Kohli',
      handle: '@urja_kohli',
      avatar: 'https://pbs.twimg.com/profile_images/1661599388692606976/Ak1GXaRE_400x400.jpg',
      verified: true,
      yoloStockValue: 23456,
    },
    content: "how many side projects made you some bucks?",
    timestamp: '7h',
  },
   {
    id: 5,
    user: {
      name: 'Fede',
      handle: '@buildwithfede',
      avatar: 'https://pbs.twimg.com/profile_images/1699479393322541056/k1NTE4IF_400x400.jpg',
      verified: true,
      yoloStockValue: 98765,
    },
    content: "Still haven't met a single non-technical person launching a production-ready app.",
    timestamp: '1h',
  },
  {
    id: 6,
    user: {
      name: 'Alex Ruber',
      handle: '@alex_ruber',
      avatar: 'https://pbs.twimg.com/profile_images/1664403332454653953/ER2pufp3_400x400.jpg',
      verified: true,
      yoloStockValue: 123456,
    },
    content: `day 145 of building candle, the duolingo for relationships

failed 7x this week, a few long format and short form failures, then hit again with long format

experimented with super long (60+ seconds) this time for tt. only 130k views so far but incredible conversion at ~8% view`,
    timestamp: '2h',
  },
  {
    id: 7,
    user: {
      name: 'Sidessh',
      handle: '@SidesshMore',
      avatar: 'https://pbs.twimg.com/profile_images/1792945839252848640/5gH7B2_N_400x400.jpg',
      verified: true,
      yoloStockValue: 76543,
    },
    content: "Another year from now, you'll wish you had started today.",
    timestamp: '1d',
  },
  {
    id: 8,
    user: {
      name: 'Saanvi',
      handle: '@Saaannvvii',
      avatar: 'https://pbs.twimg.com/profile_images/1753874351317524480/PahG9b2C_400x400.jpg',
      verified: true,
      yoloStockValue: 87654,
    },
    content: "You are not so crazy if you still write your own code.",
    timestamp: '1d',
  },
    {
    id: 9,
    user: {
      name: 'Enod Bataa',
      handle: '@enod_bataa',
      avatar: 'https://pbs.twimg.com/profile_images/1632360588731351040/L6pI7fgx_400x400.jpg',
      verified: false,
      yoloStockValue: 34567,
    },
    content: "2/ Unpopular opinion: The best way to get results from AI isn't by being nice—it's by challenging it.",
    timestamp: '1d',
  },
  {
    id: 10,
    user: {
      name: 'Urja Kohli',
      handle: '@urja_kohli',
      avatar: 'https://pbs.twimg.com/profile_images/1661599388692606976/Ak1GXaRE_400x400.jpg',
      verified: true,
      yoloStockValue: 45678,
    },
    content: "how many side projects made you some bucks? For real.",
    timestamp: '1d',
  },
   {
    id: 11,
    user: {
      name: 'Fede',
      handle: '@buildwithfede',
      avatar: 'https://pbs.twimg.com/profile_images/1699479393322541056/k1NTE4IF_400x400.jpg',
      verified: true,
      yoloStockValue: 111111,
    },
    content: "Still haven't met a single non-technical person launching a production-ready app. This is a copy.",
    timestamp: '2d',
  },
  {
    id: 12,
    user: {
      name: 'Alex Ruber',
      handle: '@alex_ruber',
      avatar: 'https://pbs.twimg.com/profile_images/1664403332454653953/ER2pufp3_400x400.jpg',
      verified: true,
      yoloStockValue: 222222,
    },
    content: `day 146 of building candle, the duolingo for relationships. Another copy`,
    timestamp: '2d',
  },
];

const Timeline = () => {
  return (

    <div className="w-full max-w-2xl mx-auto text-white h-screen flex flex-col px-12 py-12">
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
                      {thread.user.yoloStockValue && (
                        <div className="text-sm text-gray-400 mt-2 justify-end items-center">
                            Yolo Stock: <span className='font-bold text-gray-200'>${thread.user.yoloStockValue.toLocaleString()}</span>
                        </div>
                    )}
                  </div>

                  <p className='whitespace-pre-wrap mt-2'>{thread.content}</p>
                   <div className="flex items-center gap-2 mt-4 w-full">
                        <Button variant="ghost" className="w-1/2 bg-transparent text-green-400 hover:bg-green-900/50 hover:text-green-300 flex items-center gap-2 group">
                            <TrendingUp className="h-4 w-4 transform transition-transform duration-200 group-hover:scale-110" />
                            <span>Buy</span>
                        </Button>
                        <Button variant="ghost" className="w-1/2 bg-transparent text-red-400 hover:bg-red-900/50 hover:text-red-300 flex items-center gap-2 group">
                            <TrendingDown className="h-4 w-4 transform transition-transform duration-200 group-hover:scale-110" />
                            <span>Sell</span>
                        </Button>
                  </div>
              </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline; 