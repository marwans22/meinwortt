import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface GroupChatProps {
  groupId: string;
  userId: string;
}

export const GroupChat = ({ groupId, userId }: GroupChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("group_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(m => m.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]));
        
        const messagesWithProfiles = data.map(msg => ({
          ...msg,
          profiles: profilesMap.get(msg.user_id) || { full_name: "Unbekannt", avatar_url: null }
        }));

        setMessages(messagesWithProfiles as Message[]);
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast.error("Fehler beim Laden der Nachrichten");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", payload.new.user_id)
            .single();

          const newMsg = {
            ...payload.new,
            profiles: profileData,
          } as Message;

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from("group_messages").insert({
        group_id: groupId,
        user_id: userId,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Fehler beim Senden der Nachricht");
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Gruppenchat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Lade Nachrichten...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Noch keine Nachrichten. Schreib die erste!
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message) => {
                const isOwnMessage = message.user_id === userId;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 animate-fade-in ${
                      isOwnMessage ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {message.profiles?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex flex-col gap-1 max-w-[70%] ${
                        isOwnMessage ? "items-end" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {message.profiles?.full_name || "Unbekannt"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), "HH:mm", {
                            locale: de,
                          })}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
        <form
          onSubmit={handleSend}
          className="border-t p-4 flex gap-2 bg-background"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nachricht schreiben..."
            maxLength={500}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
