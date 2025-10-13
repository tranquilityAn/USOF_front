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

/**
 * hydratePost(post: object) -> Promise<object>
 * - не робить зайвих запитів: добирає лише те, чого немає у post
 * - підтримує обидва поля ідентифікатора автора: authorId / userId
 */
export async function hydratePost(p) {
    // не мутуємо вхідний об’єкт
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
            const comments = await fetchCommentsByPostRequest(post.id);
            post.commentsCount = comments?.length ?? 0;
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
