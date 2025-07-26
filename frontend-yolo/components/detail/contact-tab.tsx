import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ContactTab = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Get in Touch</h2>
        <p className="mt-3 text-lg text-zinc-400">
          Whether you're a potential partner or a talented individual looking to join our mission, we'd love to hear from you.
        </p>
      </div>
      <form className="mt-10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 sr-only">Name</label>
            <Input id="name" type="text" placeholder="Your Name" className="bg-zinc-800 border-zinc-700 placeholder:text-zinc-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 sr-only">Email</label>
            <Input id="email" type="email" placeholder="Your Email" className="bg-zinc-800 border-zinc-700 placeholder:text-zinc-500" />
          </div>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-zinc-300 sr-only">Message</label>
          <Textarea id="message" placeholder="Your Message" rows={6} className="bg-zinc-800 border-zinc-700 placeholder:text-zinc-500" />
        </div>
        <div className="text-right">
          <Button type="submit" className="bg-white text-black hover:bg-zinc-200 px-8 py-3">
            Send Message
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactTab;
