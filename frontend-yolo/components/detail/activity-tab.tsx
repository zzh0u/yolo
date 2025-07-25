import React from 'react';

const activities = [
  {
    date: 'July 21, 2024',
    title: 'DIA Oracle Gasdrop on Arbitrum',
    description: 'The DIA Oracle Gasdrop on Arbitrum is a program designed to reduce the gas costs for dApps on Arbitrum by providing gas-optimized price oracles.',
  },
  {
    date: 'July 15, 2024',
    title: 'Partnership with ZetaChain Announced',
    description: 'DIA has announced a new partnership with ZetaChain, an L1 blockchain with built-in chain abstraction, to provide transparent and reliable price oracles.',
  },
  {
    date: 'June 28, 2024',
    title: 'New Randomness Oracle Deployed',
    description: 'DIA has deployed a new randomness oracle on multiple chains, providing a secure and verifiable source of randomness for on-chain applications.',
  },
  {
    date: 'June 10, 2024',
    title: 'Integration with Mode Network',
    description: 'DIA has integrated its oracle suite with Mode Network, a modular L2 designed for hyper-growth, bringing reliable price feeds to its ecosystem.',
  },
];

const ActivityTab = () => {
  return (
    <div className="relative pl-8">
      <div className="absolute left-8 top-0 bottom-0 w-px bg-zinc-800"></div>
      <div className="space-y-12">
        {activities.map((activity, index) => (
          <div key={index} className="relative">
            <div className="absolute -left-10 top-1.5 h-4 w-4 rounded-full bg-zinc-700 border-4 border-zinc-950"></div>
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
