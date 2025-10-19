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
  group_id: string;
  profile: {
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
  }, [groupId]);

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMsg = payload.new;
          
          // Fetch profile for new message
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", newMsg.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              ...newMsg,
              profile: profileData || { full_name: "Unbekannt", avatar_url: null },
            } as Message,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    setLoading(true);
    try {
      // First get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("group_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(messagesData.map((m) => m.user_id))];

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create profiles map
      const profilesMap = new Map(
        profilesData?.map((p) => [p.id, p]) || []
      );

      // Combine messages with profiles
      const messagesWithProfiles = messagesData.map((msg) => ({
        ...msg,
        profile: profilesMap.get(msg.user_id) || {
          full_name: "Unbekannt",
          avatar_url: null,
        },
      }));

      setMessages(messagesWithProfiles as Message[]);
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast.error("Fehler beim Laden der Nachrichten");
    } finally {
      setLoading(false);
    }
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
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={message.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {message.profile?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex flex-col gap-1 max-w-[70%] ${
                        isOwnMessage ? "items-end" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {message.profile?.full_name || "Unbekannt"}
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
