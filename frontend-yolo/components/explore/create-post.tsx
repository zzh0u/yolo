import React, { useState } from 'react';
import { Image as ImageIcon, ListOrdered, Smile, Calendar, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const userAvatar = "https://pbs.twimg.com/profile_images/1638618797188599808/DXIXe_4Q_400x400.jpg";

interface NewThread {
    userId: number;
    content: string;
}

const CreatePost = () => {
    const [newThread, setNewThread] = useState<NewThread>({
        userId: 1, // TODO: get user id from session
        content: 'Test content',
    });
    const handleCreateThread = async (thread: NewThread) => {
        const response = await fetch('http://localhost:8080/api/v1/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(thread),
        });
        const data = await response.json();
        console.log(data);
    }

    return (
        <div className="flex gap-4 p-4 border-b border-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={userAvatar} alt="User avatar" className="w-12 h-12 rounded-full" />
            <div className="w-full">
                <textarea
                    placeholder="What's happening?"
                    className="w-full bg-transparent text-2xl placeholder-gray-500 focus:outline-none resize-none"
                    rows={1}
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                />


                <div className="border-b border-gray-800 mb-4 mt-2"></div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-blue-400">
                        <ImageIcon size={20} className="cursor-pointer hover:text-blue-300 transition-colors" />
                    </div>
                    <Button
                        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-full disabled:opacity-50 text-base flex items-center gap-2 transition-colors"
                        onClick={() => handleCreateThread(newThread)}
                    >
                        <Send size={16} />
                        <span>Build in Public</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost; 