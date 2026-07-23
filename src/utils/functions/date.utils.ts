export const formatDate = (timestamp: number, locale: string = "fr-FR") => {
    return new Date(timestamp * 1000).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};