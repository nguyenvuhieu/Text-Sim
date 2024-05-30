export const getLocaleFromLS = () => localStorage.getItem("locale") || "en";

export const setLocaleToLS = (locale) => {
  localStorage.setItem("locale", locale);
};
