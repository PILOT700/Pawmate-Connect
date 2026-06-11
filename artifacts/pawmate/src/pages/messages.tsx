import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, ArrowLeft } from "lucide-react";
import { PawPrint } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const conversations = [
  { id: "1", name: "Eleanor", pet: "Oliver", species: "cat", avatar: "/profile1.png", lastMessage: "That sounds perfect! Let's do Sunday.", time: "10:42 AM", unread: true, online: true },
  { id: "2", name: "James", pet: "Buster", species: "dog", avatar: "/profile2.png", lastMessage: "Buster loves that park.", time: "Yesterday", unread: false, online: false },
  { id: "3", name: "Maya", pet: "Luna", species: "dog", avatar: "/profile3.png", lastMessage: "Haha yes! Luna does the exact same thing.", time: "Tue", unread: false, online: true },
  { id: "4", name: "David", pet: "Milo", species: "dog", avatar: "/profile2.png", lastMessage: "Are you free this weekend?", time: "Mon", unread: true, online: false },
  { id: "5", name: "Chloe", pet: "Cleo", species: "cat", avatar: "/profile1.png", lastMessage: "Thanks for the recommendation!", time: "Sun", unread: false, online: false },
  { id: "6", name: "Marcus", pet: "Rex", species: "dog", avatar: "/profile3.png", lastMessage: "Rex is exhausted now lol", time: "Last week", unread: false, online: false },
];

const chatHistory = [
  { id: 1, sender: "Eleanor", text: "Hi! Your dog is so cute! What breed is Milo?", time: "9:00 AM", isMe: false },
  { id: 2, sender: "Me", text: "Hey Eleanor! Thank you, he's a mix, mostly terrier we think. Oliver is stunning, I love orange tabbies.", time: "9:15 AM", isMe: true },
  { id: 3, sender: "Eleanor", text: "Thanks! He's a menace but I love him. Are you guys going to the dog park this weekend?", time: "9:30 AM", isMe: false },
  { id: 4, sender: "Me", text: "We're actually planning to go to the trails on Saturday morning. You ever take Oliver out?", time: "9:45 AM", isMe: true },
  { id: 5, sender: "Eleanor", text: "He has a backpack! I've been meaning to try the trails. Mind if we tag along?", time: "10:00 AM", isMe: false },
  { id: 6, sender: "Me", text: "Not at all, that would be great. Milo loves meeting new friends.", time: "10:15 AM", isMe: true },
  { id: 7, sender: "Eleanor", text: "Awesome! What time were you thinking?", time: "10:20 AM", isMe: false },
  { id: 8, sender: "Me", text: "Probably around 9am before it gets too hot.", time: "10:25 AM", isMe: true },
  { id: 9, sender: "Eleanor", text: "That sounds perfect! Let's do Sunday.", time: "10:42 AM", isMe: false },
];

export default function Messages() {
  const [activeChat, setActiveChat] = useState(conversations[0]);
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false); // Mobile toggle

  return (
    <div className="container mx-auto px-4 md:px-8 py-4 md:py-8 h-[calc(100vh-5rem)]">
      <div className="bg-card rounded-[2rem] border border-card-border shadow-sm h-full flex overflow-hidden">
        
        {/* Left Panel - Conversation List */}
        <div className={`w-full md:w-1/3 border-r border-border flex flex-col bg-card ${showChat ? 'hidden md:flex' : 'flex'}`}>
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
          
          <div className="px-6 pb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active</h3>
          </div>
          <Separator className="bg-border/50" />
          
          <ScrollArea className="flex-1">
            {conversations.map((chat) => (
              <button
                key={chat.id}
                className={`w-full text-left p-4 flex gap-4 items-center transition-colors border-b border-border/20 ${
                  activeChat.id === chat.id 
                    ? 'bg-secondary/30 border-l-4 border-l-primary' 
                    : 'hover:bg-secondary/20 border-l-4 border-l-transparent'
                }`}
                onClick={() => {
                  setActiveChat(chat);
                  setShowChat(true);
                }}
                data-testid={`btn-chat-${chat.id}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                  </div>
                  {chat.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"></span>}
                  {!chat.online && chat.unread && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-accent rounded-full border-2 border-card"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-foreground truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{chat.time}</span>
                  </div>
                  <div className="flex items-center text-xs text-primary font-medium mb-0.5">
                    <PawPrint className="w-3 h-3 mr-1" />
                    {chat.pet}
                  </div>
                  <p className={`text-sm truncate ${chat.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Right Panel - Chat Thread */}
        <div className={`w-full md:w-2/3 flex-col bg-[#FCFBF8] relative ${showChat ? 'flex' : 'hidden md:flex'}`}>
          {/* Chat Header */}
          <div className="h-20 border-b border-border px-4 md:px-6 flex items-center justify-between bg-card shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setShowChat(false)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden">
                <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-medium text-foreground leading-tight">{activeChat.name}</h3>
                <p className="text-xs text-muted-foreground">with {activeChat.pet}</p>
              </div>
            </div>
            <div className="flex gap-1 md:gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground hidden sm:flex">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Top Gradient Fade */}
          <div className="absolute top-20 left-0 right-0 h-6 bg-gradient-to-b from-card to-transparent pointer-events-none z-10"></div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="space-y-6">
              <div className="text-center pb-4 pt-2">
                <span className="text-[11px] font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
              </div>
              
              {chatHistory.map((msg, idx) => {
                const isLastMsg = idx === chatHistory.length - 1;
                return (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!msg.isMe && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-auto">
                          <img src={activeChat.avatar} alt={msg.sender} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`p-3.5 shadow-sm text-[15px] ${
                            msg.isMe 
                              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm' 
                              : 'bg-card border border-border text-foreground rounded-2xl rounded-bl-sm'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 px-1">
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {msg.time}
                          </span>
                          {msg.isMe && isLastMsg && (
                            <span className="text-[10px] text-primary font-semibold">Seen</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 md:p-4 bg-card border-t border-border shrink-0">
            <form 
              className="flex gap-2 items-end"
              onSubmit={(e) => { e.preventDefault(); setMessage(""); }}
            >
              <div className="bg-secondary/60 rounded-[1.5rem] flex-1 flex items-center px-2 min-h-[56px] border border-border/50 focus-within:border-primary/30 focus-within:bg-secondary transition-colors">
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0 rounded-full w-10 h-10">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="bg-transparent w-full focus:outline-none text-[15px] py-3 px-2"
                  data-testid="input-chat-message"
                />
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0 rounded-full w-10 h-10 hidden sm:flex">
                  <Smile className="w-5 h-5" />
                </Button>
              </div>
              <Button 
                type="submit" 
                size="icon" 
                className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0 shadow-sm transition-transform active:scale-95"
                disabled={!message.trim()}
                data-testid="btn-send-message"
              >
                <Send className="w-5 h-5 ml-1" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
