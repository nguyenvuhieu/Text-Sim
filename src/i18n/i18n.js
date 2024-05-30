import { initReactI18next } from "react-i18next";

import i18n from "i18next";
import HOME_EN from "../locales/en/home.json";
import ABOUT_EN from "../locales/en/about.json";
import PRODUCT_EN from "../locales/en/product.json";
import COMMON_EN from "../locales/en/common.json";
import NOTFOUND_EN from "../locales/en/notFound.json";
import DATA_EN from "../locales/en/data.json";
import CORPUS_EN from "../locales/en/corpus.json";
import HOME_VI from "../locales/vi/home.json";
import ABOUT_VI from "../locales/vi/about.json";
import PRODUCT_VI from "../locales/vi/product.json";
import COMMON_VI from "../locales/vi/common.json";
import NOTFOUND_VI from "../locales/vi/notFound.json";
import DATA_VI from "../locales/vi/data.json";
import CORPUS_VI from "../locales/vi/corpus.json";
import { getLocaleFromLS } from "../utils/utils";

export const locales = {
  en: "English",
  vi: "Tiếng Việt"
};

export const resources = {
  en: {
    home: HOME_EN,
    about: ABOUT_EN,
    product: PRODUCT_EN,
    notFound: NOTFOUND_EN,
    common: COMMON_EN,
    data: DATA_EN,
    corpus: CORPUS_EN
  },
  vi: {
    home: HOME_VI,
    about: ABOUT_VI,
    product: PRODUCT_VI,
    notFound: NOTFOUND_VI,
    common: COMMON_VI,
    data: DATA_VI,
    corpus: CORPUS_VI
  }
};

export const defaultNS = "home";

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng: getLocaleFromLS(),
  ns: ["home", "about", "product", "common", "notFound", "data", "corpus"],
  fallbackLng: getLocaleFromLS(),
  defaultNS,
  interpolation: {
    escapeValue: false // react already safes from xss
  }
});
