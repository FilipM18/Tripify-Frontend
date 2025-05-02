// Ešte poriadne nefunguje bude treba opraviť
import { fetchComments } from '@/utils/api';
import { getToken } from '@/utils/auth';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const CommentsSection = ({ tripId }: { tripId: string }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [tripId]);
  

  if (loading) return <ActivityIndicator />;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;
  if (!comments.length) return <Text>No comments yet.</Text>;

  return (
    <View>
      {comments.map((comment, idx) => (
        <View key={idx} style={styles.commentItem}>
            <Text style={styles.commentAuthor}>{comment.createdAt}</Text>
          <Text style={styles.commentAuthor}>{comment.userId}</Text>
          <Text style={styles.commentText}>{comment.commentText}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  commentItem: { marginBottom: 8 },
  commentAuthor: { fontWeight: 'bold', fontSize: 14 },
  commentText: { fontSize: 14, color: '#222' },
});

export default CommentsSection;
