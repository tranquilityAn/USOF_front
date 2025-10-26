import { fetchPostReactionsRequest, fetchCommentsByPostRequest } from './postsApi';
import { fetchUserByIdRequest } from '../authors/authorsApi';

const countReactions = (arr = []) => {
    let likes = 0, dislikes = 0;
    for (const r of arr) {
        if (r?.type === 'like') likes++;
        else if (r?.type === 'dislike') dislikes++;
    }
    return { likes, dislikes };
};

export async function hydratePost(p) {
    const post = { ...p };

    // 1) Reactions
    if (post.likesCount == null || post.dislikesCount == null) {
        try {
            const reactions = await fetchPostReactionsRequest(post.id);
            const { likes, dislikes } = countReactions(reactions);
            post.likesCount = likes;
            post.dislikesCount = dislikes;
        } catch {
            post.likesCount = post.likesCount ?? 0;
            post.dislikesCount = post.dislikesCount ?? 0;
        }
    }

    // 2) Comments count
    if (post.commentsCount == null) {
        try {
            const commentsRes = await fetchCommentsByPostRequest(post.id);

            if (Array.isArray(commentsRes)) {
                post.commentsCount = commentsRes.length;
            } else if (commentsRes && typeof commentsRes === 'object') {
                const { total, items } = commentsRes;
                post.commentsCount =
                    (typeof total === 'number')
                        ? total
                        : (Array.isArray(items) ? items.length : 0);
            } else {
                post.commentsCount = 0;
            }
        } catch {
            post.commentsCount = post.commentsCount ?? 0;
        }
    }
    
    // 3) Author
    if (!post.author && (post.authorId || post.userId)) {
        const authorId = post.authorId ?? post.userId;
        try {
            const u = await fetchUserByIdRequest(authorId);
            post.author = u;
        } catch {

        }
    }

    return post;
}
