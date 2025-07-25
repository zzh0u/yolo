import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Profile() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center">
        <Avatar className="size-24">
          <AvatarImage src="/img/jobs.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-2xl font-bold">Steve Jobs</h1>
        <p className="text-muted-foreground">s.jobs@apple.com</p>
      </div>
    </div>
  );
}