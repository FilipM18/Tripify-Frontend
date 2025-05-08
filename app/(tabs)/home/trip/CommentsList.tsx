// Ešte poriadne nefunguje bude treba opraviť
import { fetchComments } from '@/utils/api';
import { getToken } from '@/utils/auth';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';

const CommentsSection = ({ tripId, refreshTrigger }: { tripId: string, refreshTrigger?: any }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const data = await fetchComments(tripId, token);
        if (!data.success) throw new Error(data.error || 'Failed to fetch comments');
        setComments(data.comments || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tripId, refreshTrigger]);
  

  if (loading) return <ActivityIndicator />;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;
  if (!comments.length) return <Text style={{color: theme.secondText}}>No comments yet.</Text>;

  const styles = StyleSheet.create({
    commentItem: { padding: 10, borderBottomWidth: 1, borderBottomColor:  theme.secondText},
    
    commentContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "fff" },
    commentImage: { width: 35, height: 35, borderRadius: 25, marginRight: 10, backgroundColor: "fff" },
    commentContent: { flex: 1, marginLeft: 5 },
    commentTextContainer: { marginTop: 5 },
    commentAuthor: { fontWeight: 'bold', fontSize: 14, color: theme.text },
    commentText: { fontSize: 14, color: theme.text, marginTop: 5 },
    commentCreatedAt: { fontSize: 12, color: theme.onSurfaceVariant, marginTop: 5 },
  });

  return (
    <View>
      {comments.map((comment, idx) => (
        <View key={idx} style={styles.commentItem}>
          <View style={styles.commentContainer}>
            <Image source={require("@/assets/avatar_placeholder.png")} style={styles.commentImage} />  
            <View style={styles.commentContent}>
              <Text style={styles.commentAuthor}>{comment.userId}</Text>
              <Text style={styles.commentCreatedAt}>{comment.createdAt}</Text>
            </View>
          </View>
          <Text style={styles.commentText}>{comment.commentText}</Text>
        </View>
      ))}
    </View>
  );
};

export default CommentsSection;
