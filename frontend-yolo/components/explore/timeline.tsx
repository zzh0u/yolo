import React from 'react';
import CreatePost from '@/components/explore/create-post';
import { MoreHorizontal, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

const threads = [
  {
    id: 1,
    user: {
      name: 'Sidessh',
      handle: '@SidesshMore',
      avatar: '/img/sam.png',
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
      avatar: '/img/elon.png',
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
      avatar: '/img/jobs.png',
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
      avatar: '/img/sam.png',
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
      avatar: '/img/elon.png',
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
      avatar: '/img/jobs.png',
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
      avatar: '/img/sam.png',
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
      avatar: '/img/elon.png',
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
      avatar: '/img/jobs.png',
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
      avatar: '/img/sam.png',
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
      avatar: '/img/elon.png',
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
      avatar: '/img/jobs.png',
      verified: true,
      yoloStockValue: 222222,
    },
    content: `day 146 of building candle, the duolingo for relationships. Another copy`,
    timestamp: '2d',
  },
];

const Timeline = () => {
  const router = useRouter();
  const handleBuy = (stock: string) => {
    router.push(`/explore/${stock}`)
  }
  const handleSell = (stock: string) => {
    router.push(`/explore/${stock}`)
  }

  return (

    <div className="w-full max-w-2xl mx-auto text-white h-screen flex flex-col px-12 py-12">
      <CreatePost />
      <div className="flex-1 overflow-y-auto">
        {threads.map(thread => (
          <div key={thread.id} className="flex gap-4 p-4 border-b border-gray-800">
            <Avatar className="w-12 h-12">
              <AvatarImage src={thread.user.avatar} alt={`${thread.user.name}'s avatar`} />
              <AvatarFallback>{thread.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='w-full'>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                          <span className="font-bold hover:underline cursor-pointer">{thread.user.name}</span>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-500 hover:underline cursor-pointer">{thread.timestamp} ago</span>
                          
                      </div>
                      {thread.user.yoloStockValue && (
                        <div className="text-sm text-gray-400 mt-2 justify-end items-center">
                            Yolo Stock: <span className='font-bold text-gray-200'>${thread.user.yoloStockValue.toLocaleString()}</span>
                        </div>
                    )}
                  </div>

                  <p className='whitespace-pre-wrap mt-2'>{thread.content}</p>
                   <div className="flex items-center gap-2 mt-4 w-full">
                        <Button variant="ghost" className="w-1/2 bg-transparent text-green-400 hover:bg-green-900/50 hover:text-green-300 flex items-center gap-2 group border-1 border-green-200" onClick={() => handleBuy(thread.user.name)}>
                            <TrendingUp className="h-4 w-4 transform transition-transform duration-200 group-hover:scale-110" />
                            <span>Buy</span>
                        </Button>
                        <Button variant="ghost" className="w-1/2 bg-transparent text-red-400 hover:bg-red-900/50 hover:text-red-300 flex items-center gap-2 group border-1 border-red-200" onClick={() => handleSell(thread.user.name)}>
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