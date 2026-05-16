export const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};