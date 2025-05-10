import { fetchComments } from '@/utils/api';
import { getToken } from '@/utils/auth';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { useWebSocket } from '@/utils/WebSocketContext';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

const CommentsSection = ({ tripId, refreshTrigger }: { tripId: string, refreshTrigger?: any }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { subscribe } = useWebSocket();
  const { isTablet } = useScreenDimensions();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Nemáte prístup');
        const data = await fetchComments(tripId, token);
        if (!data.success) throw new Error(data.error || 'Chyba pri načítaní komentárov');
        setComments(data.comments || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const unsubscribe = subscribe('new-comment', (data) => {
      if (data.tripId.toString() === tripId) {
        setComments(prevComments => [
          ...prevComments,
          {
            userId: data.username,
            userPhotoUrl: data.userPhotoUrl,
            commentText: data.commentText,
            createdAt: data.createdAt
          }
        ]);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [tripId, refreshTrigger, subscribe]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = useScaledStyles((scale) => ({
    container: {
      flex: 1,
    },
    loadingContainer: {
      padding: 16 * Math.sqrt(scale),
      alignItems: 'center',
    },
    errorContainer: {
      padding: 16 * Math.sqrt(scale),
      alignItems: 'center',
    },
    errorText: {
      color: 'red',
      fontSize: 14 * scale,
    },
    emptyText: {
      fontSize: 14 * scale,
      color: theme.secondText,
      textAlign: 'center',
      padding: 16 * Math.sqrt(scale),
    },
    commentItem: { 
      padding: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale), 
      borderBottomWidth: 1, 
      borderBottomColor: theme.border,
      marginBottom: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
    },
    commentContainer: { 
      flexDirection: 'row', 
      alignItems: 'center',
    },
    commentImage: { 
      width: isTablet ? 42 * Math.sqrt(scale) : 35 * Math.sqrt(scale), 
      height: isTablet ? 42 * Math.sqrt(scale) : 35 * Math.sqrt(scale), 
      borderRadius: isTablet ? 21 * Math.sqrt(scale) : 17.5 * Math.sqrt(scale), 
      marginRight: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale), 
      backgroundColor: theme.background,
    },
    commentContent: { 
      flex: 1, 
      marginLeft: isTablet ? 8 * Math.sqrt(scale) : 5 * Math.sqrt(scale),
    },
    commentTextContainer: { 
      marginTop: isTablet ? 8 * Math.sqrt(scale) : 5 * Math.sqrt(scale),
    },
    commentText: { 
      fontSize: isTablet ? 16 * scale : 14 * scale, 
      color: theme.text, 
      marginTop: isTablet ? 8 * Math.sqrt(scale) : 5 * Math.sqrt(scale),
    },
    commentCreatedAt: { 
      fontSize: isTablet ? 14 * scale : 12 * scale, 
      color: theme.thirdText, 
      marginTop: isTablet ? 6 * Math.sqrt(scale) : 5 * Math.sqrt(scale),
    },
  }));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="small" 
          color={theme.primary} 
          accessibilityLabel="Načítavanie komentárov"
        />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AccessibleText 
          variant="body" 
          color="red"
          style={styles.errorText}
          accessibilityLabel={`Chyba: ${error}`}
        >
          {error}
        </AccessibleText>
      </View>
    );
  }
  
  if (!comments.length) {
    return (
      <AccessibleText 
        variant="body" 
        style={styles.emptyText}
        accessibilityLabel="Zatiaľ žiadne komentáre"
      >
        Zatiaľ žiadne komentáre
      </AccessibleText>
    );
  }

  return (
    <View 
      style={styles.container}
      accessibilityLabel={`${comments.length} komentárov`}
    >
      {comments.map((comment, idx) => (
        <View 
          key={idx} 
          style={styles.commentItem}
          accessibilityLabel={`Komentár od užívateľa ${comment.userId}: ${comment.commentText}`}
        >
          <View style={styles.commentContainer}>
            <Image 
              source={require("@/assets/avatar_placeholder.png")} 
              style={styles.commentImage}
              accessibilityLabel={`Profilový obrázok užívateľa ${comment.userId}`}
            />  
            <View style={styles.commentContent}>
              <AccessibleText 
                variant="bodyBold"
                color={theme.text}
              >
                {comment.userId}
              </AccessibleText>
              <AccessibleText 
                variant="caption"
                color={theme.thirdText}
              >
                {formatDate(comment.createdAt)}
              </AccessibleText>
            </View>
          </View>
          <AccessibleText 
            variant="body"
            style={styles.commentText}
          >
            {comment.commentText}
          </AccessibleText>
        </View>
      ))}
    </View>
  );
};

export default CommentsSection;