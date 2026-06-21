type CommentWithRelato = {
    id: number;
    text: string;
    userId: number;
    createdAt: Date;
    user: { id: number; name: string };
    experience: {
        id: number;
        placeId: number;
        title: string | null;
        place: { id: number; name: string };
    };
};

export function formatComment(comment: CommentWithRelato) {
    return {
        id: comment.id,
        text: comment.text,
        userId: comment.userId,
        userName: comment.user.name,
        createdAt: comment.createdAt,
        relato: {
            id: comment.experience.id,
            title: comment.experience.title,
            placeId: comment.experience.placeId,
        },
        local: {
            id: comment.experience.place.id,
            name: comment.experience.place.name,
        },
        // compatibilidade com clientes que leem experienceId diretamente
        experienceId: comment.experience.id,
    };
}

export function formatCommentList(comments: CommentWithRelato[]) {
    return comments.map(formatComment);
}
