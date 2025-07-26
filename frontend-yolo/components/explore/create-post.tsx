import React, { useState } from 'react';
import { Image as ImageIcon, ListOrdered, Smile, Calendar, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const userAvatar = "https://pbs.twimg.com/profile_images/1638618797188599808/DXIXe_4Q_400x400.jpg";

interface NewThread {
    userId: number;
    content: string;
}

interface AlertState {
    show: boolean;
    message: string;
    type: 'success' | 'error';
}

const CreatePost = () => {
    const [newThread, setNewThread] = useState<NewThread>({
        userId: 1, // TODO: get user id from session
        content: 'Test content',
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertState>({
        show: false,
        message: '',
        type: 'success'
    });
    
    const handleCreateThread = async (thread: NewThread) => {
        if (!thread.content.trim()) {
            setAlert({
                show: true,
                message: '内容不能为空',
                type: 'error'
            });
            setTimeout(() => setAlert({ ...alert, show: false }), 3000);
            return;
        }
        
                setIsSubmitting(true);
        try {
            // 使用Next.js API路由而不是直接调用后端API
            console.log('发送帖子数据:', thread);
            const response = await fetch('/api/create-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(thread),
            });
            
            const result = await response.json();
            console.log('API响应:', result);
            
            if (!response.ok) {
                throw new Error(result.error || '发布失败');
            }
            
            // 清空输入框并显示成功提示
            setNewThread({ ...newThread, content: '' });
            setAlert({
                show: true,
                message: '发布成功！',
                type: 'success'
            });
            
            // 3秒后隐藏提示
            setTimeout(() => setAlert({ ...alert, show: false }), 3000);
        } catch (error) {
            console.error('发布失败:', error);
            setAlert({
                show: true,
                message: error instanceof Error ? error.message : '发布失败，请稍后重试',
                type: 'error'
            });
            setTimeout(() => setAlert({ ...alert, show: false }), 3000);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex gap-4 p-4 border-b border-gray-800 relative">
            {/* 提示信息 */}
            {alert.show && (
                <div className={`absolute top-0 left-0 right-0 p-2 text-center text-white font-medium transition-all ${
                    alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                    <div className="flex items-center justify-center gap-2">
                        {alert.type === 'success' ? 
                            <CheckCircle size={16} /> : 
                            <AlertCircle size={16} />
                        }
                        {alert.message}
                    </div>
                </div>
            )}
            
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
                        disabled={isSubmitting}
                    >
                        <Send size={16} />
                        <span>{isSubmitting ? '发布中...' : 'Build in Public'}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost; 