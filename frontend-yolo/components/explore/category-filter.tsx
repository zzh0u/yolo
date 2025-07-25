import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "Art",
  "Gaming",
  "Memberships",
  "Music",
  "PFPs",
  "Photography",
  "Domain Names",
  "Sports Collectibles",
  "Virtual Worlds",
];

export function CategoryFilter() {
  return (
    <div className="w-64 p-4 border-r border-gray-800 bg-[#141416]">
      <h2 className="text-lg font-semibold mb-4 text-white">Category</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === 'All' ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full justify-start"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
} 