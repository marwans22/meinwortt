import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Flag } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link } from "react-router-dom";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  petition_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
  comment_likes: { id: string; user_id: string }[];
}

interface PetitionCommentsProps {
  petitionId: string;
  currentUserId: string | null;
}

export const PetitionComments = ({ petitionId, currentUserId }: PetitionCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  useEffect(() => {
    loadComments();
  }, [petitionId, sortBy]);

  const loadComments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("petition_comments")
        .select(`
          *,
          profiles!petition_comments_user_id_fkey(full_name, avatar_url),
          comment_likes(id, user_id)
        `)
        .eq("petition_id", petitionId);

      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      let sortedData = data || [];
      if (sortBy === "popular") {
        sortedData = sortedData.sort((a, b) => 
          (b.comment_likes?.length || 0) - (a.comment_likes?.length || 0)
        );
      }

      setComments(sortedData as any);
    } catch (error: any) {
      console.error("Error loading comments:", error);
      toast.error("Fehler beim Laden der Kommentare");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      toast.error("Bitte melde dich an, um zu kommentieren");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const { error } = await supabase.from("petition_comments").insert({
        petition_id: petitionId,
        user_id: currentUserId,
        content: newComment.trim(),
      });

      if (error) throw error;

      toast.success("Kommentar wurde gepostet");
      setNewComment("");
      loadComments();
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast.error("Fehler beim Posten des Kommentars");
    }
  };

  const handleLike = async (commentId: string, isLiked: boolean) => {
    if (!currentUserId) {
      toast.error("Bitte melde dich an");
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("comment_likes").insert({
          comment_id: commentId,
          user_id: currentUserId,
        });

        if (error) throw error;
      }

      loadComments();
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error("Fehler beim Liken");
    }
  };

  const handleReport = async (commentId: string) => {
    if (!currentUserId) {
      toast.error("Bitte melde dich an");
      return;
    }

    try {
      const { error } = await supabase.from("reports").insert({
        comment_id: commentId,
        reporter_id: currentUserId,
        reason: "inappropriate",
        description: "Unangemessener Kommentar",
      });

      if (error) throw error;
      toast.success("Kommentar wurde gemeldet");
    } catch (error: any) {
      console.error("Error reporting comment:", error);
      toast.error("Fehler beim Melden");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Kommentare ({comments.length})
        </h3>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "newest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("newest")}
          >
            Neueste
          </Button>
          <Button
            variant={sortBy === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("popular")}
          >
            Beliebteste
          </Button>
        </div>
      </div>

      {currentUserId && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Teile deine Meinung..."
            className="min-h-[100px]"
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {newComment.length}/1000
            </span>
            <Button type="submit" disabled={!newComment.trim()}>
              Kommentieren
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Lädt Kommentare...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Noch keine Kommentare. Sei der Erste!
          </div>
        ) : (
          comments.map((comment) => {
            const isLiked = comment.comment_likes?.some(
              (like) => like.user_id === currentUserId
            );
            const likesCount = comment.comment_likes?.length || 0;

            return (
              <div
                key={comment.id}
                className="flex gap-4 pb-4 border-b last:border-0 animate-fade-in"
              >
                <Link to={`/profile/${comment.user_id}`}>
                  <Avatar>
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {comment.profiles?.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile/${comment.user_id}`}
                      className="font-semibold hover:underline"
                    >
                      {comment.profiles?.full_name || "Unbekannt"}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(comment.created_at), "d. MMM yyyy, HH:mm", {
                        locale: de,
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(comment.id, isLiked)}
                      className={isLiked ? "text-primary" : ""}
                    >
                      <Heart
                        className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                      />
                      {likesCount > 0 && likesCount}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReport(comment.id)}
                    >
                      <Flag className="w-4 h-4 mr-1" />
                      Melden
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
