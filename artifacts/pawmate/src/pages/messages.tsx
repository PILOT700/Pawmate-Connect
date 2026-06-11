import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Phone, Video, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const conversations = [
  { id: "1", name: "Eleanor", pet: "Oliver (Cat)", avatar: "/profile1.png", lastMessage: "That sounds perfect! Let's do Sunday.", time: "10:42 AM", unread: true },
  { id: "2", name: "James", pet: "Buster (Dog)", avatar: "/profile2.png", lastMessage: "Buster loves that park.", time: "Yesterday", unread: false },
  { id: "3", name: "Maya", pet: "Luna (Dog)", avatar: "/profile3.png", lastMessage: "Haha yes! Luna does the exact same thing.", time: "Tue", unread: false },
];

const chatHistory = [
  { id: 1, sender: "Eleanor", text: "Hi! Your dog is so cute! What breed is Milo?", time: "9:00 AM", isMe: false },
  { id: 2, sender: "Me", text: "Hey Eleanor! Thank you, he's a mix, mostly terrier we think. Oliver is stunning, I love orange tabbies.", time: "9:15 AM", isMe: true },
  { id: 3, sender: "Eleanor", text: "Thanks! He's a menace but I love him. Are you guys going to the dog park this weekend?", time: "9:30 AM", isMe: false },
  { id: 4, sender: "Me", text: "We're actually planning to go to the trails on Saturday morning. You ever take Oliver out?", time: "9:45 AM", isMe: true },
  { id: 5, sender: "Eleanor", text: "He has a backpack! I've been meaning to try the trails. Mind if we tag along?", time: "10:00 AM", isMe: false },
  { id: 6, sender: "Me", text: "Not at all, that would be great. Milo loves meeting new friends.", time: "10:15 AM", isMe: true },
  { id: 7, sender: "Eleanor", text: "That sounds perfect! Let's do Sunday.", time: "10:42 AM", isMe: false },
];

export default function Messages() {
  const [activeChat, setActiveChat] = useState(conversations[0]);
  const [message, setMessage] = useState("");

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 h-[calc(100vh-5rem)]">
      <div className="bg-card rounded-[2rem] border border-card-border shadow-sm h-full flex overflow-hidden">
        
        {/* Left Panel - Conversation List */}
        <div className="w-full md:w-1/3 border-r border-border flex flex-col bg-card">
          <div className="p-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">Messages</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-10 h-10 bg-secondary border-none rounded-full"
                data-testid="input-search-messages"
              />
            </div>
          </div>
          <Separator className="bg-border/50" />
          
          <ScrollArea className="flex-1">
            {conversations.map((chat) => (
              <button
                key={chat.id}
                className={`w-full text-left p-4 flex gap-4 items-center transition-colors border-b border-border/20 ${activeChat.id === chat.id ? 'bg-secondary/50' : 'hover:bg-secondary/20'}`}
                onClick={() => setActiveChat(chat)}
                data-testid={`btn-chat-${chat.id}`}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                  </div>
                  {chat.unread && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-accent rounded-full border-2 border-card"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-foreground truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{chat.time}</span>
                  </div>
                  <p className="text-xs text-primary font-medium mb-0.5">{chat.pet}</p>
                  <p className={`text-sm truncate ${chat.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Right Panel - Chat Thread */}
        <div className="hidden md:flex flex-col w-2/3 bg-background/50">
          {/* Chat Header */}
          <div className="h-20 border-b border-border px-6 flex items-center justify-between bg-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{activeChat.name}</h3>
                <p className="text-xs text-muted-foreground">with {activeChat.pet}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">Today</span>
              </div>
              
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex gap-3 max-w-[75%]">
                    {!msg.isMe && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-auto">
                        <img src={activeChat.avatar} alt={msg.sender} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div 
                        className={`p-4 rounded-2xl ${
                          msg.isMe 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-card border border-border text-foreground rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <span className={`text-[10px] text-muted-foreground mt-1.5 block ${msg.isMe ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-card border-t border-border">
            <form 
              className="flex gap-2 items-end"
              onSubmit={(e) => { e.preventDefault(); setMessage(""); }}
            >
              <div className="bg-secondary rounded-2xl flex-1 flex items-center px-4 min-h-[56px]">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="bg-transparent w-full focus:outline-none text-sm py-3"
                  data-testid="input-chat-message"
                />
              </div>
              <Button 
                type="submit" 
                size="icon" 
                className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
                disabled={!message.trim()}
                data-testid="btn-send-message"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
